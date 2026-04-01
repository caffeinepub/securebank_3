import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User types
  type PasswordHash = Text;

  public type UserProfile = {
    fullName : Text;
    email : Text;
    phone : Text;
    address : Text;
  };

  public type SecureUserProfile = {
    profile : UserProfile;
    passwordHash : PasswordHash;
  };

  public type PublicUserProfile = {
    fullName : Text;
    email : Text;
    phone : Text;
  };

  // Bank types
  public type AccountType = {
    #checking;
    #savings;
  };

  public type BankAccount = {
    accountNumber : Nat;
    accountLabel : Text;
    accountType : AccountType;
    balance : Int;
    owner : Principal;
  };

  public type TransactionType = {
    #debit;
    #credit;
  };

  public type Transaction = {
    timestamp : Time.Time;
    accountNumber : Nat;
    description : Text;
    amount : Int;
    transactionType : TransactionType;
    balanceAfter : Int;
  };

  public type TransferRequest = {
    fromAccount : Nat;
    toAccount : Nat;
    amount : Int;
    description : Text;
    passwordHash : PasswordHash;
  };

  public type TransferResult = {
    #success : (Int, Int);
    #insufficientFunds;
    #accountNotFound;
    #unauthorized;
    #invalidAmount;
  };

  public type DashboardData = {
    accounts : [BankAccount];
    recentTransactions : [Transaction];
  };

  var nextAccountNumber = 1000001;

  // Storage
  let users = Map.empty<Principal, SecureUserProfile>();
  let bankAccounts = Map.empty<Nat32, BankAccount>();
  let transactions = Map.empty<Nat32, Transaction>();

  // Utility function to map AccountType to Text for sorting
  func accountTypeToText(accountType : AccountType) : Text {
    switch (accountType) {
      case (#checking) { "checking" };
      case (#savings) { "savings" };
    };
  };

  // Required profile interface functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (users.get(caller)) {
      case (null) { null };
      case (?secureProfile) { ?secureProfile.profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Preserve existing password hash if profile exists
    let passwordHash = switch (users.get(caller)) {
      case (null) { "" }; // Default empty password hash for new profiles
      case (?existing) { existing.passwordHash };
    };
    let secureProfile : SecureUserProfile = {
      profile;
      passwordHash;
    };
    users.add(caller, secureProfile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?secureProfile) { ?secureProfile.profile };
    };
  };

  // Create or update a secure user profile with password
  public shared ({ caller }) func saveSecureUserProfile(profile : UserProfile, passwordHash : PasswordHash) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let secureProfile : SecureUserProfile = {
      profile;
      passwordHash;
    };
    users.add(caller, secureProfile);
  };

  // Get full secure profile (requires password verification)
  public shared ({ caller }) func getSecureUserProfile(passwordHash : PasswordHash) : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access this data");
    };
    switch (users.get(caller)) {
      case (null) { null };
      case (?secureProfile) {
        if (secureProfile.passwordHash != passwordHash) {
          null;
        } else {
          ?secureProfile.profile;
        };
      };
    };
  };

  // Get public profile (requires authentication - users can view other users' public info)
  public query ({ caller }) func getPublicUserProfile(user : Principal) : async ?PublicUserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view public profiles");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?secureProfile) {
        ?{
          fullName = secureProfile.profile.fullName;
          email = secureProfile.profile.email;
          phone = secureProfile.profile.phone;
        };
      };
    };
  };

  // Create a new bank account
  public shared ({ caller }) func createBankAccount(accountType : AccountType, accountLabel : Text, initialBalance : Int) : async BankAccount {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create accounts");
    };
    if (initialBalance < 0) { Runtime.trap("Initial balance cannot be negative") };
    let accountNumber = nextAccountNumber;
    nextAccountNumber += 1;

    let account : BankAccount = {
      accountNumber;
      accountLabel;
      accountType;
      balance = initialBalance;
      owner = caller;
    };

    bankAccounts.add(accountNumber.toNat32(), account);

    // Record initial balance transaction
    let transactionNumber = (accountNumber + 1_000_000).toNat32();
    let initialTransaction : Transaction = {
      timestamp = Time.now();
      accountNumber;
      description = if (initialBalance > 0) {
        "Initial deposit";
      } else {
        "Account created";
      };
      amount = initialBalance;
      transactionType = #credit;
      balanceAfter = initialBalance;
    };
    transactions.add(transactionNumber, initialTransaction);

    account;
  };

  // Transfer funds between accounts
  public shared ({ caller }) func transferFunds(request : TransferRequest) : async TransferResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can transfer funds");
    };
    if (request.amount <= 0) { return #invalidAmount };

    // Fetch from account
    switch (bankAccounts.get(request.fromAccount.toNat32())) {
      case (null) { return #accountNotFound };
      case (?fromAccount) {
        // Check ownership or admin role
        if (fromAccount.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          return #unauthorized;
        };

        // Verify password
        switch (users.get(caller)) {
          case (null) { return #unauthorized };
          case (?userProfile) {
            if (userProfile.passwordHash != request.passwordHash) {
              return #unauthorized;
            };
          };
        };

        if (fromAccount.balance < request.amount) { return #insufficientFunds };

        // Fetch to account
        switch (bankAccounts.get(request.toAccount.toNat32())) {
          case (null) { return #accountNotFound };
          case (?toAccount) {
            let newFromBalance = fromAccount.balance - request.amount;
            let newToBalance = toAccount.balance + request.amount;

            // Update balances
            let updatedFromAccount : BankAccount = {
              fromAccount with
              balance = newFromBalance;
            };
            let updatedToAccount : BankAccount = {
              toAccount with
              balance = newToBalance;
            };

            bankAccounts.add(request.fromAccount.toNat32(), updatedFromAccount);
            bankAccounts.add(request.toAccount.toNat32(), updatedToAccount);

            // Record transactions
            let fromTransactionNumber = (request.fromAccount + 1_000_000).toNat32();
            let toTransactionNumber = (request.toAccount + 1_000_000).toNat32();

            let fromTransaction : Transaction = {
              timestamp = Time.now();
              accountNumber = request.fromAccount;
              description = request.description # " (to " # request.toAccount.toText() # ")";
              amount = -request.amount;
              transactionType = #debit;
              balanceAfter = newFromBalance;
            };
            let toTransaction : Transaction = {
              timestamp = Time.now();
              accountNumber = request.toAccount;
              description = request.description # " (from " # request.fromAccount.toText() # ")";
              amount = request.amount;
              transactionType = #credit;
              balanceAfter = newToBalance;
            };

            transactions.add(fromTransactionNumber, fromTransaction);
            transactions.add(toTransactionNumber, toTransaction);

            #success(newFromBalance, newToBalance);
          };
        };
      };
    };
  };

  // Get all accounts for a user
  public query ({ caller }) func getUserAccounts(user : Principal) : async [BankAccount] {
    if (user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own accounts");
    };

    bankAccounts.values().toArray().filter(func(account) { account.owner == user });
  };

  // Get transaction history for an account
  public query ({ caller }) func getTransactionHistory(accountNumber : Nat) : async [Transaction] {
    switch (bankAccounts.get(accountNumber.toNat32())) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) {
        if (account.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own account history");
        };

        transactions.values().toArray().filter(func(t) { t.accountNumber == accountNumber });
      };
    };
  };

  // Get dashboard data for user
  public query ({ caller }) func getDashboardData() : async DashboardData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access dashboard");
    };

    let userAccounts = bankAccounts.values().toArray().filter(func(account) { account.owner == caller });

    // Get last 10 transactions (sorted by timestamp)
    let recentTransactions = transactions.values().toArray().filter(func(t) {
      userAccounts.findIndex(func(account) { account.accountNumber == t.accountNumber }) != null;
    });

    {
      accounts = userAccounts;
      recentTransactions;
    };
  };
};
