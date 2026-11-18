export function mapAuthError(error: any): string {
  if (!error) return 'Terjadi kesalahan tidak dikenal.';

  const message = typeof error === 'string' ? error : error.message || '';

  if (message.includes('Invalid login credentials')) {
    return 'Email atau kata sandi salah. Silakan periksa kembali.';
  }
  if (message.includes('User already registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.';
  }
  if (message.includes('Password should be at least')) {
    return 'Kata sandi minimal 6 karakter.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.';
  }
  if (message.includes('Network request failed') || message.includes('Failed to fetch')) {
    return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
  }
  if (message.includes('Anonymous')) {
    return 'Mode tamu belum diaktifkan di server.';
  }

  return message || 'Gagal memproses autentikasi.';
}
