from __future__ import annotations

import os

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


def _cipher(key: bytes, iv: bytes) -> Cipher:
    return Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())


def encrypt_bytes(data: bytes, key: bytes) -> bytes:
    iv = os.urandom(16)
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded = padder.update(data) + padder.finalize()
    encryptor = _cipher(key, iv).encryptor()
    ciphertext = encryptor.update(padded) + encryptor.finalize()
    return iv + ciphertext


def decrypt_bytes(data: bytes, key: bytes) -> bytes:
    iv, ciphertext = data[:16], data[16:]
    decryptor = _cipher(key, iv).decryptor()
    padded = decryptor.update(ciphertext) + decryptor.finalize()
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    return unpadder.update(padded) + unpadder.finalize()

