const _sodium = require('libsodium-wrappers');

module.exports = async (key) => {
    await _sodium.ready;
    const sodium = _sodium;
    if (!key) {
        throw "no key";
    }
    return {
        decrypt: (ciphertext, nonce) => {
            if (!ciphertext || !nonce) {
                throw new Error('Either one of the arguments is undefined.');
            }
            return sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
        }
    }
}
