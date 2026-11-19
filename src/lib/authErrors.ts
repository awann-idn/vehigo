export function mapAuthError(error: any): string {
  if (!error) return 'Terjadi kesalahan tidak dikenal.';

  const message = typeof error === 'string' ? error : error.message || '';

  if (message.includes('Invalid login credentials')) {
    return 'Email belum terdaftar, email belum dikonfirmasi, atau kata sandi salah. Gunakan email yang sama persis dengan saat mendaftar.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Email belum dikonfirmasi. Cek inbox email Anda sebelum masuk.';
  }
  if (message.includes('provider is not enabled') || message.includes('Unsupported provider')) {
    return 'Provider login belum diaktifkan di Supabase Dashboard.';
  }
  if (message.includes('400') || message.includes('validation_failed')) {
    return 'Data login ditolak server. Pastikan email valid dan akun sudah terdaftar.';
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
