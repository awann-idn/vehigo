import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useCreateVehicle, useUpdateVehicle, useVehicle } from '../../hooks/useVehicles';
import { saveVehiclePhoto } from '../../api/vehicles';
import { useAuth } from '../../features/auth/useAuth';
import { pickAndCompressImage, uploadDocument } from '../../lib/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerAddVehicle'>;

const angles = ['Sisi depan', 'Sisi belakang', 'Interior', 'Sisi kanan', 'Sisi kiri'];

type VehicleFormProps = {
  userId: string;
  vehicleId?: string;
  initial: {
    name: string;
    plate: string;
    year: string;
    pricePerDay: string;
    transmission: string;
  };
  onSaved: () => void;
};

function VehicleForm({ userId, vehicleId, initial, onSaved }: VehicleFormProps) {
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const isEdit = !!vehicleId;

  const [name, setName] = useState(initial.name);
  const [plate, setPlate] = useState(initial.plate);
  const [year, setYear] = useState(initial.year);
  const [pricePerDay, setPricePerDay] = useState(initial.pricePerDay);
  const [transmission, setTransmission] = useState(initial.transmission);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  const handlePickPhoto = async (angle: string) => {
    try {
      const uri = await pickAndCompressImage([4, 3]);
      if (uri) {
        setPhotos((current) => ({ ...current, [angle]: uri }));
        Alert.alert('Foto dipilih', `Foto ${angle} akan disimpan bersama kendaraan.`);
      }
    } catch (err: any) {
      Alert.alert('Info', err.message);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !plate.trim()) {
      Alert.alert('Perhatian', 'Nama kendaraan dan nomor polisi wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        plate: plate.trim().toUpperCase(),
        year: parseInt(year, 10) || 2023,
        price_per_day: parseInt(pricePerDay, 10) || 350000,
        transmission,
      };
      const savedVehicle = vehicleId
        ? await updateVehicleMutation.mutateAsync({ id: vehicleId, ...payload })
        : await createVehicleMutation.mutateAsync({ mitra_id: userId, ...payload });

      const savedId = vehicleId ?? savedVehicle?.id;
      if (savedId) {
        for (const [angle, uri] of Object.entries(photos)) {
          const upload = await uploadDocument(userId, 'vehicle', uri);
          await saveVehiclePhoto({ vehicleId: savedId, ownerId: userId, angle, storagePath: upload.path });
        }
      }

      Alert.alert('Sukses', isEdit ? 'Kendaraan berhasil diperbarui!' : 'Kendaraan berhasil ditambahkan!', [
        { text: 'OK', onPress: onSaved },
      ]);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat menyimpan kendaraan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Text style={styles.subtitle}>
        Lengkapi informasi kendaraan untuk mulai disewakan. Ambil foto sesuai sudut yang
        diminta untuk menghasilkan tampilan 360° kendaraan.
      </Text>

      <View style={styles.form}>
        <TextField
          label="Nama Kendaraan"
          placeholder="Contoh: BMW M4 Competition"
          value={name}
          onChangeText={setName}
        />
        <TextField
          label="Nomor Polisi"
          placeholder="BG 1234 XX"
          autoCapitalize="characters"
          value={plate}
          onChangeText={setPlate}
        />
        <TextField
          label="Tahun"
          placeholder="2023"
          keyboardType="number-pad"
          value={year}
          onChangeText={setYear}
        />
        <TextField
          label="Harga Sewa / Hari"
          placeholder="350000"
          keyboardType="number-pad"
          value={pricePerDay}
          onChangeText={setPricePerDay}
        />

        <Text style={styles.label}>TRANSMISI</Text>
        <SegmentedTabs options={['Matic', 'Manual']} value={transmission} onChange={setTransmission} />

        <Text style={styles.label}>FOTO 360°</Text>
        <View style={styles.angles}>
          {angles.map((angle) => (
            <Pressable
              key={angle}
              style={styles.angle}
              onPress={() => handlePickPhoto(angle)}
            >
              <Camera size={20} color={colors.primary} />
              <Text style={styles.angleText}>{angle}</Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton
          label={isEdit ? 'Simpan Perubahan' : 'Simpan Kendaraan'}
          onPress={handleSave}
          loading={loading || createVehicleMutation.isPending || updateVehicleMutation.isPending}
        />
      </View>
    </>
  );
}

export default function OwnerAddVehicleScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const vehicleId = route.params?.id;
  const { data: existingVehicle } = useVehicle(vehicleId ?? '');

  return (
    <Screen scroll>
      <AppHeader
        title={vehicleId ? 'Ubah Kendaraan' : 'Tambah Kendaraan'}
        onBack={() => navigation.goBack()}
      />

      {vehicleId && !existingVehicle ? (
        <Text style={styles.subtitle}>Memuat data kendaraan...</Text>
      ) : user ? (
        <VehicleForm
          key={existingVehicle?.id ?? 'new'}
          userId={user.id}
          vehicleId={vehicleId}
          initial={
            existingVehicle
              ? {
                  name: existingVehicle.name,
                  plate: existingVehicle.plate,
                  year: String(existingVehicle.year),
                  pricePerDay: String(existingVehicle.pricePerDay),
                  transmission: existingVehicle.transmission,
                }
              : {
                  name: '',
                  plate: '',
                  year: '2023',
                  pricePerDay: '350000',
                  transmission: 'Matic',
                }
          }
          onSaved={() => navigation.goBack()}
        />
      ) : (
        <Text style={styles.subtitle}>Anda harus login terlebih dahulu.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.bodySm,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  form: {
    gap: spacing.base,
  },
  label: {
    ...typography.label,
    color: colors.text.secondary,
  },
  angles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  angle: {
    width: '47%',
    height: 90,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
  },
  angleText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
