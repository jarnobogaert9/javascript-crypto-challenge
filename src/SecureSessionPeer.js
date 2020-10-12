const _sodium = require('libsodium-wrappers');
const Decryptor = require('./Decryptor');
module.exports = async (peer) => {
    await _sodium.ready;
    const sodium = _sodium;

    const { publicKey, privateKey } = sodium.crypto_kx_keypair();
    let rx = undefined;
    let tx = undefined;
    let otherPeer = undefined;
    let msg = undefined;
    
    let obj = Object.freeze({
        publicKey: publicKey,
        encrypt(msg) {
            const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
            const ciphertext = sodium.crypto_secretbox_easy(msg, nonce, tx);
            return {
                nonce: nonce,
                ciphertext: ciphertext
            }
        },
        decrypt(cipher, nonce) {
            return sodium.crypto_secretbox_open_easy(cipher, nonce, rx);
        },
        send(msg) {
            const encrypted = this.encrypt(msg);
            otherPeer.setMsg(encrypted);
        },
        receive() {
            return this.decrypt(msg.ciphertext, msg.nonce);
        },
        generateSharedKeys(key) {
            const {sharedRx, sharedTx} = sodium.crypto_kx_server_session_keys(publicKey, privateKey, key);
            rx = sharedRx;
            tx = sharedTx;
        },
        setMsg(incomingMsg) {
            msg = incomingMsg;
        },
        setOtherPeer(peer) {
            otherPeer = peer;
        }
    });

    
    if (peer) {
        let pair = sodium.crypto_kx_client_session_keys(publicKey, privateKey, peer.publicKey);
        rx = pair.sharedRx;
        tx = pair.sharedTx;
        // Generate shared keys in the server
        peer.generateSharedKeys(obj.publicKey);
        // Make the server peer aware of the client peer
        peer.setOtherPeer(obj);
        // Make client peer aware of server peer
        obj.setOtherPeer(peer);
    }
    

    return obj;
}