pragma solidity 0.4.24;

import "../openzeppelin/migrations/Initializable.sol";
import "../openzeppelin/lifecycle/Destructible.sol";
import "./Managed.sol";
import "./DonationBadge.sol";

// https://github.com/Heritage-Aero/heritage
contract Heritage is Managed, DonationBadge, Initializable, Destructible{

    uint256 constant MAX_DONATIONS = 2**128 - 1;
    bool public issueDonationEnabled = false;
    mapping (uint256 => bool) public isFiat;

    function initialize(bool enableIssueDonation)
        external
        payable
        isInitializer
    {
        require(msg.value == 0);

        issueDonationEnabled = enableIssueDonation;
        _createFundraiser("Genesis Donation", 0, this, "", false);
    }

    event ReclaimEther(uint256 balance);

    modifier issueDonationIsEnabled() {
        require(issueDonationEnabled);
        _;
    }

    modifier donationIdIsValid(uint256 _donationId) {
        uint256 totalDonations = donations.length;

        require(_donationId > 0);
        require(_donationId < totalDonations);
        require(totalDonations < MAX_DONATIONS);
        _;
    }

    modifier onlyTokenOwner(uint256 _donationId) {
        require(msg.sender == ownerOf(_donationId));
        _;
    }

    // Cannot prevent Ether from being mined/self-destructed to this contract
    // reclaim lost Ether.
    function reclaimEther() external onlyOwner {
        uint256 _balance = address(this).balance;

        owner.transfer(_balance);
        emit ReclaimEther(_balance);
    }

    function createFundraiser(
        string _description,
        uint256 _goal,
        address _beneficiary,
        string _taxId,
        bool _claimable
    )
      public
      onlyManagers
      whenNotPaused
      returns (uint256)
    {
        require(donations.length < MAX_DONATIONS);
        return _createFundraiser(_description, _goal, _beneficiary, _taxId, _claimable);
    }

    // Make a donation based on Id.
    function makeDonation(uint256 _donationId)
      public
      payable
      whenNotPaused
      donationIdIsValid(_donationId)
      returns (uint256)
    {
        require(msg.value > 0);
        // Lookup the original donation
        uint256 donationId = donations[_donationId].donationId;

        // Cannot donate to deleted token/null address
        require(donationBeneficiary[donationId] != address(0));
        // A goal of 0 is uncapped
        if (donationGoal[donationId] > 0) {
            // It must not have reached it's goal
            require(donationRaised[donationId] < donationGoal[donationId]);
        }

        // Send the tx value to the charity
        donationBeneficiary[donationId].transfer(msg.value);
        donationRaised[_donationId] += msg.value;
        return _makeDonation(donationId, msg.value, msg.sender, true);
    }

    // Make a DAI donation based on Id.
    function makeDonation(uint256 _donationId, uint256 _amount)
      public
      whenNotPaused
      donationIdIsValid(_donationId)
      returns (uint256)
    {
        require(_amount > 0);
        // Lookup the original donation
        uint256 donationId = donations[_donationId].donationId;
        // Must be a DAI donation token
        
        //require(isToken[donationId]);
        // Cannot donate to deleted token/null address
        require(donationBeneficiary[donationId] != address(0));
        // A goal of 0 is uncapped
        if (donationGoal[donationId] > 0) {
            // It must not have reached it's goal
            require(donationRaised[donationId] < donationGoal[donationId]);
        }

        // Send the tx value to the charity
        //_transferDai(msg.sender, donationBeneficiary[donationId], _amount);
        donationRaised[_donationId] += _amount;
        return _makeDonation(donationId, _amount, msg.sender, true);
    }

    // Managers may issue donations directly. A way to accept fiat donations
    // and credit an address. Optional -- disable/enable at deployment.
    // Does not effect contract totals. Must issue to a created donation.
    function issueDonation(uint256 _donationId, uint256 _amount, address _donor)
      public
      onlyManagers
      issueDonationIsEnabled
      whenNotPaused
      donationIdIsValid(_donationId)
      returns (uint256)
    {
        // Lookup the original donation
        uint256 donationId = donations[_donationId].donationId;

        uint256 id = _makeDonation(donationId, _amount, _donor, false);
        isFiat[id];
        return id;
    }

    function claimDonation(uint256 _donationId)
      public
      whenNotPaused
      onlyTokenOwner(_donationId)
    {
        _claimDonation(msg.sender, _donationId);
    }

    function deleteDonation(uint256 _donationId)
      public
      onlyOwner
      whenNotPaused
      donationIdIsValid(_donationId)
    {
        _deleteDonation(_donationId);
    }

    /* fallback */
    function () public {
        revert();
    }
}