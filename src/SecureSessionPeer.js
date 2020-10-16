const _sodium = require('libsodium-wrappers');
const Decryptor = require('./Decryptor');
const Encryptor = require('./Encryptor');
module.exports = async (peer) => {
    await _sodium.ready;
    const sodium = _sodium;

    const { publicKey, privateKey } = sodium.crypto_kx_keypair();
    let rx = undefined;
    let tx = undefined;
    let otherPeer = undefined;
    let msg = undefined;
    let decryptor = undefined;
    let encryptor = undefined;

    let obj = Object.freeze({
        publicKey: publicKey,
        encrypt(msg) {
            return encryptor.encrypt(msg);
        },
        decrypt(cipher, nonce) {
            return decryptor.decrypt(cipher, nonce);
        },
        send(msg) {
            const encrypted = this.encrypt(msg);
            otherPeer.setMsg(encrypted);
        },
        receive() {
            return this.decrypt(msg.ciphertext, msg.nonce);
        },
        generateSharedKeys(key) {
            const { sharedRx, sharedTx } = sodium.crypto_kx_server_session_keys(publicKey, privateKey, key);
            rx = sharedRx;
            tx = sharedTx;
        },
        setMsg(incomingMsg) {
            msg = incomingMsg;
        },
        setOtherPeer(peer) {
            otherPeer = peer;
        },
        async setDecryptor() {
            decryptor = await Decryptor(rx);
        },
        async setEncryptor() {
            encryptor = await Encryptor(tx);
        }
    });


    if (peer) {
        const { sharedRx, sharedTx } = sodium.crypto_kx_client_session_keys(publicKey, privateKey, peer.publicKey);
        rx = sharedRx;
        tx = sharedTx;
        // Generate shared keys in the server
        peer.generateSharedKeys(obj.publicKey);
        // Make the server peer aware of the client peer
        peer.setOtherPeer(obj);
        // Make client peer aware of server peer
        obj.setOtherPeer(peer);

        /**
         * Decryptor initializers
         */
        // Initialize decryptor in the server
        await peer.setDecryptor();

        // Initialize decryptor in the client
        await obj.setDecryptor();

        /**
         * Encryptor initializers
         */
        // Initialize encryptor in the server
        await peer.setEncryptor();
        // Initialize encryptor in the client
        await obj.setEncryptor();

    }


    return obj;
}