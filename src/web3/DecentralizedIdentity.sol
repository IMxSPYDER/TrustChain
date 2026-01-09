// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DecentralizedIdentity {

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

    mapping(address => User) public users;

    // keep mappings private – access via functions only
    mapping(address => Credential[]) private userCredentials;
    mapping(address => AccessRequest[]) private accessRequests;

    event UserRegistered(address indexed user, string name, string email, Role role);
    event CredentialAdded(address indexed user, string credentialHash);
    event CredentialRequested(address indexed user, address requester, string credentialHash);
    event AccessGranted(address indexed user, address requester, string credentialHash);
    event AccessRevoked(address indexed user, address requester, string credentialHash);
    event CredentialVerified(address indexed user, address verifier, string credentialHash);

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

    /* -------------------------------------------------- */
    /*                     USER SETUP                     */
    /* -------------------------------------------------- */

    function registerUser(
        string memory _name,
        string memory _email,
        uint8 _role
    ) public {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(bytes(_name).length > 0, "Name empty");
        require(bytes(_email).length > 0, "Email empty");
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

    function isUserRegistered(address _user) public view returns (bool) {
        return users[_user].isRegistered;
    }

    function getUserRole() public view onlyRegistered returns (uint8) {
        return uint8(users[msg.sender].role);
    }

    function getUserDetails(address _user)
        public
        view
        returns (string memory, string memory, uint8, bool)
    {
        require(users[_user].isRegistered, "User not registered");
        User memory u = users[_user];
        return (u.name, u.email, uint8(u.role), u.isRegistered);
    }

    /* -------------------------------------------------- */
    /*                  CREDENTIALS                      */
    /* -------------------------------------------------- */

    function addCredential(
        string memory name,
        string memory certificateId,
        string memory dob,
        string memory certificateName,
        uint256 age,
        string memory documentIPFSHash
    ) public onlyRegistered {
        userCredentials[msg.sender].push(
            Credential({
                name: name,
                certificateId: certificateId,
                dob: dob,
                certificateName: certificateName,
                age: age,
                documentIPFSHash: documentIPFSHash,
                isVerified: false,
                isRevoked: false
            })
        );

        emit CredentialAdded(msg.sender, documentIPFSHash);
    }

    // ✅ FOR USER DASHBOARD
    function getMyCredentials()
        public
        view
        onlyRegistered
        returns (Credential[] memory)
    {
        return userCredentials[msg.sender];
    }

    // ✅ FOR INSTITUTION DASHBOARD
    function getUserCredentialsByAddress(address _user)
        public
        view
        returns (Credential[] memory)
    {
        require(users[_user].isRegistered, "User not registered");
        return userCredentials[_user];
    }

    /* -------------------------------------------------- */
    /*               ACCESS REQUESTS                     */
    /* -------------------------------------------------- */

    function requestCredential(
        address user,
        string memory credentialHash
    ) public onlyInstitution {
        accessRequests[user].push(
            AccessRequest({
                requester: msg.sender,
                credentialHash: credentialHash,
                isApproved: false
            })
        );

        emit CredentialRequested(user, msg.sender, credentialHash);
    }

    function grantAccess(
        address requester,
        string memory credentialHash,
        bool zkVerification
    ) public onlyRegistered {
        require(zkVerification, "ZKP failed");

        AccessRequest[] storage reqs = accessRequests[msg.sender];

        for (uint256 i = 0; i < reqs.length; i++) {
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

    function revokeAccess(
        address requester,
        string memory credentialHash
    ) public onlyRegistered {
        AccessRequest[] storage reqs = accessRequests[msg.sender];

        for (uint256 i = 0; i < reqs.length; i++) {
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

    function getAccessRequestsByUser(address user)
        public
        view
        returns (AccessRequest[] memory)
    {
        return accessRequests[user];
    }

    /* -------------------------------------------------- */
    /*                VERIFICATION                       */
    /* -------------------------------------------------- */

    function verifyCredential(
        address user,
        string memory credentialHash
    ) public onlyInstitution {
        Credential[] storage creds = userCredentials[user];

        for (uint256 i = 0; i < creds.length; i++) {
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
}
