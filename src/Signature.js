const _sodium = require('libsodium-wrappers');
module.exports = async () => {
    await _sodium.ready;
    const sodium = _sodium;
    /**
     * Function that returns an object with two properties
     * 1. publicKey Uint8Array 32 -> used in test code to open signature
     * 2. privateKey Uint8Array 64 -> used to sign message
     */
    const { publicKey, privateKey } = sodium.crypto_sign_keypair();
    console.log(publicKey, privateKey);
    return {
        verifyingKey: publicKey,
        sign: (msg) => {
            return sodium.crypto_sign(msg, privateKey);
        }
    }
}