const _sodium = require('libsodium-wrappers');
module.exports = async () => {
    await _sodium.ready;
    const sodium = _sodium;
    return {
        verify: (hash, pwd) => {
            return sodium.crypto_pwhash_str_verify(hash, pwd);            
        }
    }
}