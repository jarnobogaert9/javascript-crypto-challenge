const _sodium = require('libsodium-wrappers');

module.exports = async (key) => {
    await _sodium.ready;
    const sodium = _sodium;
    if (!key) {
        throw "no key";
    }
    return Object.freeze({
        decrypt: (ciphertext, nonce) => {
            if (!ciphertext || !nonce) {
                throw new Error('There are 2 arguments required.');
            }
            return sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
        }
    });
}
