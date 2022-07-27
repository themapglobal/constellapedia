const {
  NftFactory,
  configHelperNetworks,
  ConfigHelper,
  Nft,
  setContractDefaults
} = require('@oceanprotocol/lib')
import web3 from './web3';

const INBOUND_KEY = 'inbound_addrs'
const OUTBOUND_KEY = 'outbound_addrs'

class Node extends Nft {
  constructor(nftAddress, web3, network, config) {
    super(web3, network, null, config)
    this.nftAddress = nftAddress
  }

  async name() {
    const nftContract = setContractDefaults(
      new this.web3.eth.Contract(this.nftAbi, this.nftAddress),
      this.config
    )
    return await nftContract.methods.name().call()
  }

  async symbol() {
    const nftContract = setContractDefaults(
      new this.web3.eth.Contract(this.nftAbi, this.nftAddress),
      this.config
    )
    return await nftContract.methods.symbol().call()
  }

  // ==== inbounds ====

  async getInboundAddrs() {
    return await this._getAddrs(INBOUND_KEY)
  }

  async addInboundNode(account, node) {
    await this.addInboundAddr(account, node.nftAddress)
  }
  
  async addInboundAddr(account, nodeAddress) {
    await this._addAddr(account, INBOUND_KEY, nodeAddress)
  }

  // ==== outbounds ====

  async getOutboundAddrs() {
    return await this._getAddrs(OUTBOUND_KEY)
  }

  async addOutboundNode(account, node) {
    await this.addOutboundAddr(account, node.nftAddress)
  }
  
  async addOutboundAddr(account, nodeAddress) {
    await this._addAddr(account, OUTBOUND_KEY, nodeAddress)
  }

  // ==== helpers ====

  async _getAddrs(key) {
    const s = await this.getNodeData(key)
    return s.split(' ')
  }

  async _addAddr(account, key, value) {
    const s = await this.getNodeData(key)
    if (s.includes(value)) {
      throw new Error(`${value} already exists in ${key}`)
    }
    await this.setNodeData(account, key, `${s} ${value}`)
  }

  async setNodeData(account, key, value) {
    // we need to updgrae @oceanprotocol/lib to support this
    // await this.setData(this.nftAddress, account, key, value)
  }

  async getNodeData(key) {
    // we need to updgrae @oceanprotocol/lib to support this
    // return await this.getData(this.nftAddress, key)
  }
}

class NodeFactory {
  constructor() {
    console.log(web3)
    const chainId = web3.eth.chainId()
    console.log(chainId)

    this.web3 = web3
    this.config = new ConfigHelper().getConfig(chainId)

    this.factory = new NftFactory(
      config?.erc721FactoryAddress,
      this.web3
    )
  }

  async newGoal(name, account) {
    const symbol = `GOAL-${this._randomNumber()}`
    return this._newNode(symbol, name, account)
  }

  async newProject(name, account) {
    const symbol = `PROJ-${this._randomNumber()}`
    return this._newNode(symbol, name, account)
  }

  async _newNode(symbol, name, account) {
    const nftParamsAsset = {
      name: name,
      symbol: symbol,
      templateIndex: 1,
      tokenURI: 'https://oceanprotocol.com/nft/',
      transferable: true,
      owner: account
    }

    const nftAddress = await this.factory.createNFT(account, nftParamsAsset)

    const node = new Node(nftAddress, this.web3, this.network, this.config)
    await node.setNodeData(account, INBOUND_KEY, "")
    await node.setNodeData(account, OUTBOUND_KEY, "")
    return node
  }

  _randomNumber() {
    const random = Math.floor(Math.random() * 9999)
    return String(random).padStart(4, '0');
  }
}

module.exports.Node = Node
module.exports.NodeFactory = NodeFactory