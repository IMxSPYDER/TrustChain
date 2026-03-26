// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DecentralizedIdentity {

    /* -------------------------------------------------- */
    /*                     TYPES                          */
    /* -------------------------------------------------- */

    enum Role { USER, INSTITUTION }

    struct User {
        address userAddress;
        Role role;
        bool isRegistered;
        string name;
        string email;
    }

    struct Credential {
        string name;
        string certificateId;
        string dob;
        string certificateName;
        uint256 age;
        string documentIPFSHash;
        bool isVerified;
        bool isRevoked;
    }

    struct AccessRequest {
        address requester;
        string credentialHash;
        bool isApproved;
    }

    struct RecoveryRequest {
        address newWallet;
        uint256 approvals;
        uint256 startTime;
        bool executed;
    }

    /* -------------------------------------------------- */
    /*                     STORAGE                        */
    /* -------------------------------------------------- */

    mapping(address => User) public users;
    mapping(address => bytes32) public commitments;

    mapping(address => Credential[]) private userCredentials;
    mapping(address => AccessRequest[]) private accessRequests;

    // 🔐 Guardians & Recovery
    mapping(address => bytes32[]) public guardianHashes; // user => guardian hashes
    mapping(address => RecoveryRequest) public recoveryRequests;
    mapping(address => mapping(bytes32 => bool)) public guardianApproved;

    uint256 public constant RECOVERY_DELAY = 1 minutes;
    uint256 public constant REQUIRED_APPROVALS = 2;

    /* -------------------------------------------------- */
    /*                     EVENTS                         */
    /* -------------------------------------------------- */

    event UserRegistered(address indexed user, string name, string email, Role role);
    event CredentialAdded(address indexed user, string credentialHash);
    event CredentialRequested(address indexed user, address requester, string credentialHash);
    event AccessGranted(address indexed user, address requester, string credentialHash);
    event AccessRevoked(address indexed user, address requester, string credentialHash);
    event CredentialVerified(address indexed user, address verifier, string credentialHash);

    event RecoveryStarted(address indexed oldWallet, address indexed newWallet);
    event RecoveryApproved(address indexed oldWallet, bytes32 guardianHash);
    event RecoveryExecuted(address indexed oldWallet, address indexed newWallet);

    /* -------------------------------------------------- */
    /*                     MODIFIERS                      */
    /* -------------------------------------------------- */

    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    modifier onlyInstitution() {
        require(
            users[msg.sender].isRegistered &&
            users[msg.sender].role == Role.INSTITUTION,
            "Only institutions allowed"
        );
        _;
    }

    function getUserDetails(address user)
    external
    view
    returns (
        address userAddress,
        uint8 role,
        bool isRegistered,
        string memory name,
        string memory email
    )  
{
    User memory u = users[user];
    return (
        u.userAddress,
        uint8(u.role),
        u.isRegistered,
        u.name,
        u.email
    );
}


    /* -------------------------------------------------- */
    /*                  USER REGISTRATION                 */
    /* -------------------------------------------------- */

    function registerUser(
        string memory _name,
        string memory _email,
        uint8 _role
    ) external {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(_role <= uint8(Role.INSTITUTION), "Invalid role");

        users[msg.sender] = User({
            userAddress: msg.sender,
            role: Role(_role),
            isRegistered: true,
            name: _name,
            email: _email
        });

        emit UserRegistered(msg.sender, _name, _email, Role(_role));
    }

    function isUserRegistered(address user) public view returns (bool) {
        return users[user].isRegistered;
    }

    /* -------------------------------------------------- */
    /*                    GUARDIANS                       */
    /* -------------------------------------------------- */

    function registerGuardians(bytes32[] calldata _guardianHashes)
        external
        onlyRegistered
    {
        require(guardianHashes[msg.sender].length == 0, "Guardians already set");
        require(_guardianHashes.length >= REQUIRED_APPROVALS, "Not enough guardians");

        guardianHashes[msg.sender] = _guardianHashes;
    }

    /* -------------------------------------------------- */
    /*                  SOCIAL RECOVERY                   */
    /* -------------------------------------------------- */

    function startRecovery(address newWallet) external onlyRegistered {
        require(!users[newWallet].isRegistered, "New wallet already registered");
        require(guardianHashes[msg.sender].length > 0, "No guardians set");

        recoveryRequests[msg.sender] = RecoveryRequest({
            newWallet: newWallet,
            approvals: 0,
            startTime: block.timestamp,
            executed: false
        });

        emit RecoveryStarted(msg.sender, newWallet);
    }

    function approveRecovery(address oldWallet, bytes32 guardianHash) external {
        RecoveryRequest storage req = recoveryRequests[oldWallet];
        require(req.startTime != 0, "No recovery request");
        require(!req.executed, "Already executed");
        require(!guardianApproved[oldWallet][guardianHash], "Already approved");

        bool validGuardian = false;
        bytes32[] memory g = guardianHashes[oldWallet];

        for (uint i = 0; i < g.length; i++) {
            if (g[i] == guardianHash) {
                validGuardian = true;
                break;
            }
        }

        require(validGuardian, "Not a guardian");

        guardianApproved[oldWallet][guardianHash] = true;
        req.approvals += 1;

        emit RecoveryApproved(oldWallet, guardianHash);
    }

    function executeRecovery(address oldWallet) external {
        RecoveryRequest storage req = recoveryRequests[oldWallet];

        require(req.startTime != 0, "No recovery request");
        require(!req.executed, "Already executed");
        require(req.approvals >= REQUIRED_APPROVALS, "Not enough approvals");
        require(block.timestamp >= req.startTime + RECOVERY_DELAY, "Cooldown active");

        address newWallet = req.newWallet;

        users[newWallet] = users[oldWallet];
        users[newWallet].userAddress = newWallet;

        delete users[oldWallet];
        req.executed = true;

        emit RecoveryExecuted(oldWallet, newWallet);
    }

    /* -------------------------------------------------- */
    /*                  CREDENTIALS                       */
    /* -------------------------------------------------- */

    function addCredential(
        string memory name,
        string memory certificateId,
        string memory dob,
        string memory certificateName,
        uint256 age,
        string memory documentIPFSHash
    ) external onlyRegistered {
        userCredentials[msg.sender].push(
            Credential(
                name,
                certificateId,
                dob,
                certificateName,
                age,
                documentIPFSHash,
                false,
                false
            )
        );

        emit CredentialAdded(msg.sender, documentIPFSHash);
    }

    function getMyCredentials()
        external
        view
        onlyRegistered
        returns (Credential[] memory)
    {
        return userCredentials[msg.sender];
    }

    function getUserCredentialsByAddress(address user)
        external
        view
        returns (Credential[] memory)
    {
        require(users[user].isRegistered, "User not registered");
        return userCredentials[user];
    }

    /* -------------------------------------------------- */
    /*                ACCESS CONTROL                      */
    /* -------------------------------------------------- */

    function requestCredential(address user, string memory credentialHash)
        external
        onlyInstitution
    {
        accessRequests[user].push(
            AccessRequest(msg.sender, credentialHash, false)
        );

        emit CredentialRequested(user, msg.sender, credentialHash);
    }

    function grantAccess(
        address requester,
        string memory credentialHash,
        bool zkVerification
    ) external onlyRegistered {
        require(zkVerification, "ZKP failed");

        AccessRequest[] storage reqs = accessRequests[msg.sender];

        for (uint i = 0; i < reqs.length; i++) {
            if (
                reqs[i].requester == requester &&
                keccak256(bytes(reqs[i].credentialHash)) ==
                keccak256(bytes(credentialHash))
            ) {
                reqs[i].isApproved = true;
                emit AccessGranted(msg.sender, requester, credentialHash);
                return;
            }
        }

        revert("Request not found");
    }

    function revokeAccess(address requester, string memory credentialHash)
        external
        onlyRegistered
    {
        AccessRequest[] storage reqs = accessRequests[msg.sender];

        for (uint i = 0; i < reqs.length; i++) {
            if (
                reqs[i].requester == requester &&
                keccak256(bytes(reqs[i].credentialHash)) ==
                keccak256(bytes(credentialHash))
            ) {
                reqs[i].isApproved = false;
                emit AccessRevoked(msg.sender, requester, credentialHash);
                return;
            }
        }

        revert("Request not found");
    }

    /* -------------------------------------------------- */
    /*                 VERIFICATION                       */
    /* -------------------------------------------------- */

    function verifyCredential(address user, string memory credentialHash)
        external
        onlyInstitution
    {
        Credential[] storage creds = userCredentials[user];

        for (uint i = 0; i < creds.length; i++) {
            if (
                keccak256(bytes(creds[i].documentIPFSHash)) ==
                keccak256(bytes(credentialHash))
            ) {
                creds[i].isVerified = true;
                emit CredentialVerified(user, msg.sender, credentialHash);
                return;
            }
        }

        revert("Credential not found");
    }

    /* -------------------------------------------------- */
    /*                    ZKP DEMO                        */
    /* -------------------------------------------------- */

    function submitCommitment(bytes32 commitment) external onlyRegistered {
        commitments[msg.sender] = commitment;
    }
}
