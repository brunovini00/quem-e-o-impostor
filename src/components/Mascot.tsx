import { StyleSheet, View } from 'react-native';
// Marca vetorial feita com primitivas: duas figuras observando a mesma mesa.
export function Mascot({ small = false }: { small?: boolean }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.scene, small && { transform: [{ scale: 0.6 }], height: 140 }]}
    >
      <View style={styles.orbit} />
      <View style={styles.spark}>
        <View style={styles.sparkLine} />
        <View style={[styles.sparkLine, { transform: [{ rotate: '90deg' }] }]} />
      </View>
      <View style={[styles.figure, styles.backFigure]}>
        <View style={styles.eyes}>
          <View style={styles.eye}>
            <View style={styles.pupil} />
          </View>
          <View style={styles.eye}>
            <View style={styles.pupil} />
          </View>
        </View>
      </View>
      <View style={[styles.figure, styles.frontFigure]}>
        <View style={styles.eyes}>
          <View style={styles.eye}>
            <View style={[styles.pupil, { left: 10 }]} />
          </View>
          <View style={styles.eye}>
            <View style={[styles.pupil, { left: 10 }]} />
          </View>
        </View>
        <View style={styles.pocket} />
      </View>
      <View style={styles.table} />
      <View style={styles.dot} />
    </View>
  );
}
const styles = StyleSheet.create({
  scene: { height: 235, width: 290, alignSelf: 'center', position: 'relative', marginVertical: 2 },
  orbit: {
    position: 'absolute',
    width: 245,
    height: 200,
    borderWidth: 1,
    borderColor: '#525044',
    borderRadius: 120,
    left: 25,
    top: 12,
    transform: [{ rotate: '-22deg' }],
  },
  figure: {
    position: 'absolute',
    width: 120,
    height: 161,
    borderTopLeftRadius: 65,
    borderTopRightRadius: 65,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backFigure: { backgroundColor: '#C9E89A', left: 30, top: 16, transform: [{ rotate: '-12deg' }] },
  frontFigure: { backgroundColor: '#B7A1F8', left: 131, top: 55, transform: [{ rotate: '9deg' }] },
  eyes: { flexDirection: 'row', gap: 7, marginTop: 40, alignSelf: 'center' },
  eye: {
    width: 27,
    height: 35,
    backgroundColor: '#F6F1E5',
    borderRadius: 20,
    justifyContent: 'center',
  },
  pupil: { width: 12, height: 18, backgroundColor: '#202129', borderRadius: 10, left: 4 },
  pocket: {
    width: 44,
    height: 26,
    borderWidth: 2,
    borderColor: '#7E67BB',
    borderTopWidth: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginTop: 26,
    alignSelf: 'center',
  },
  table: {
    position: 'absolute',
    width: 270,
    height: 4,
    backgroundColor: '#41414B',
    bottom: 13,
    left: 9,
    borderRadius: 5,
  },
  spark: {
    position: 'absolute',
    right: 12,
    top: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkLine: {
    width: 25,
    height: 3,
    backgroundColor: '#F4CF91',
    borderRadius: 3,
    position: 'absolute',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F4CF91',
    left: 0,
    bottom: 67,
  },
});
