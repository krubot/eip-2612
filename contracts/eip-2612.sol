// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Example {
  struct airdrop {
    address airdropAddress;
    uint256 airdropAmount;
  }

  string private _name;

  string private _symbol;

  uint256 private _totalSupply;

  mapping(address => uint256) private _nonces;

  mapping(address => uint256) private _balances;

  mapping(address => mapping(address => uint256)) private _allowances;

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );

  bytes32 constant PERMIT_TYPEHASH = keccak256(
    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
  );

  event Transfer(address indexed from,address indexed to,uint256 value);

  event Approval(address indexed owner,address indexed spender,uint256 value);

  constructor(string memory name_,string memory symbol_,airdrop[] memory airdrop_) {
    _name = name_;
    _symbol = symbol_;

    for (uint i = 0; i < airdrop_.length; i++) {
      _mint(airdrop_[i].airdropAddress,airdrop_[i].airdropAmount);
    }
  }

  function name() public view virtual returns (string memory) {
    return _name;
  }

  function symbol() public view virtual returns (string memory) {
    return _symbol;
  }

  function decimals() public view virtual returns (uint8) {
    return 18;
  }

  function totalSupply() public view virtual returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) public view virtual returns (uint256) {
    return _balances[account];
  }

  function nonces(address owner) public view returns (uint) {
    return _nonces[owner];
  }

  function DOMAIN_SEPARATOR() public view returns (bytes32) {
    return keccak256(abi.encode(
        EIP712DOMAIN_TYPEHASH,
        keccak256(bytes(_name)),
        keccak256(bytes("1")),
        block.chainid,
        address(this)
    ));
  }

  function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
    require(deadline >= block.timestamp, "PERMIT_DEADLINE_EXPIRED");

    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR(),
        keccak256(abi.encode(
          PERMIT_TYPEHASH,
          owner,
          spender,
          value,
          _nonces[owner]++,
          deadline
        ))
    ));

    address recoveredAddress = ecrecover(digest, v, r, s);

    require(recoveredAddress != address(0) && recoveredAddress == owner, "INVALID_SIGNER");

    _approve(owner, spender, value);
  }

  function transfer(address to, uint256 amount) public virtual returns (bool) {
    address owner = msg.sender;
    _transfer(owner, to, amount);
    return true;
  }

  function allowance(address owner, address spender) public view virtual returns (uint256) {
    return _allowances[owner][spender];
  }

  function approve(address spender, uint256 amount) public virtual returns (bool) {
    address owner = msg.sender;
    _approve(owner, spender, amount);
    return true;
  }

  function transferFrom(address from,address to,uint256 amount) public virtual returns (bool) {
    address spender = msg.sender;
    _spendAllowance(from, spender, amount);
    _transfer(from, to, amount);
    return true;
  }

  function _mint(address account, uint256 amount) internal virtual {
    require(account != address(0), "ERC20: mint to the zero address");

    _totalSupply += amount;
    unchecked {
        // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
        _balances[account] += amount;
    }

    emit Transfer(address(0), account, amount);
  }

  function _burn(address account, uint256 amount) internal virtual {
    require(account != address(0), "ERC20: burn from the zero address");

    uint256 accountBalance = _balances[account];
    require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
    unchecked {
        _balances[account] = accountBalance - amount;
        // Overflow not possible: amount <= accountBalance <= totalSupply.
        _totalSupply -= amount;
    }

    emit Transfer(account, address(0), amount);
  }

  function _transfer(address from,address to,uint256 amount) internal virtual {
    require(from != address(0), "ERC20: transfer from the zero address");
    require(to != address(0), "ERC20: transfer to the zero address");

    uint256 fromBalance = _balances[from];
    require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
    unchecked {
      _balances[from] = fromBalance - amount;
      // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
      // decrementing then incrementing.
      _balances[to] += amount;
    }

    emit Transfer(from, to, amount);
  }

  function _approve(address owner,address spender,uint256 amount) internal virtual {
    require(owner != address(0), "ERC20: approve from the zero address");
    require(spender != address(0), "ERC20: approve to the zero address");

    _allowances[owner][spender] = amount;
    emit Approval(owner, spender, amount);
  }

  function _spendAllowance(address owner,address spender,uint256 amount) internal virtual {
    uint256 currentAllowance = allowance(owner, spender);
    if (currentAllowance != type(uint256).max) {
      require(currentAllowance >= amount, "ERC20: insufficient allowance");
      unchecked {
        _approve(owner, spender, currentAllowance - amount);
      }
    }
  }
}
