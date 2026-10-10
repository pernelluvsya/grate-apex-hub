import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated as RNAnimated, Easing as RNEasing, StyleSheet, View } from 'react-native';
import Animated, { Keyframe, Easing, useReducedMotion } from 'react-native-reanimated';

import classes from './animated-icon.module.css';
const DURATION = 300;
const INTRO_DURATION_MS = 3000;

type AnimatedSplashOverlayProps = {
  appReady: boolean;
};

export function AnimatedSplashOverlay({ appReady }: AnimatedSplashOverlayProps) {
  const [visible, setVisible] = useState(true);
  const [progress] = useState(() => new RNAnimated.Value(0));
  // Reduced motion: no energy arcs, just a short fade of the logo.
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!appReady) return;

    if (reduceMotion) progress.setValue(0.88);
    const intro = RNAnimated.timing(progress, {
      toValue: 1,
      duration: reduceMotion ? 400 : INTRO_DURATION_MS,
      easing: RNEasing.linear,
      useNativeDriver: false,
    });

    intro.start(({ finished }) => {
      if (finished) setVisible(false);
    });

    return () => intro.stop();
  }, [appReady, progress, reduceMotion]);

  if (!visible) return null;

  const overlayOpacity = progress.interpolate({
    inputRange: [0, 0.88, 1],
    outputRange: [1, 1, 0],
  });
  const logoScale = progress.interpolate({
    inputRange: [0, 0.16, 0.78, 0.88, 1],
    outputRange: [0.96, 1, 1, 1.025, 1],
  });
  const energyOpacity = progress.interpolate({
    inputRange: [0, 0.16, 0.32, 0.76, 0.84, 0.91, 1],
    outputRange: [0, 0, 0.62, 0.55, 1, 0.56, 0],
  });
  const apexOpacity = progress.interpolate({
    inputRange: [0, 0.3, 0.72, 0.84, 0.92, 1],
    outputRange: [0, 0, 0.4, 0.85, 0.55, 0],
  });
  const apexScale = progress.interpolate({
    inputRange: [0, 0.3, 0.72, 0.84, 0.92, 1],
    outputRange: [0.6, 0.6, 0.8, 1.35, 1.7, 1.9],
  });
  const goldRotation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['-24deg', '336deg'],
  });
  const whiteRotation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['28deg', '-332deg'],
  });

  return (
    <RNAnimated.View
      pointerEvents="none"
      style={[styles.splashOverlay, { opacity: overlayOpacity }]}>
      <View style={styles.logoStage}>
        {!reduceMotion && (
        <>
        <RNAnimated.View
          style={[
            styles.energyArc,
            styles.goldArc,
            { opacity: energyOpacity, transform: [{ rotate: goldRotation }] },
          ]}>
          <View style={[styles.energySpark, styles.goldSparkOne]} />
          <View style={[styles.energySpark, styles.goldSparkTwo]} />
          <View style={[styles.energySpark, styles.goldSparkThree]} />
        </RNAnimated.View>
        <RNAnimated.View
          style={[
            styles.energyArc,
            styles.whiteArc,
            { opacity: energyOpacity, transform: [{ rotate: whiteRotation }] },
          ]}
        />
        </>
        )}
        <RNAnimated.View
          style={[
            styles.logoImageFrame,
            { transform: [{ scale: logoScale }] },
          ]}>
          <Image
            style={styles.splashLogo}
            source={require('@/assets/images/grateapex-logo.png')}
            contentFit="contain"
          />
        </RNAnimated.View>
        {!reduceMotion && (
        <RNAnimated.View
          style={[
            styles.apexPulse,
            { opacity: apexOpacity, transform: [{ scale: apexScale }] },
          ]}
        />
        )}
      </View>
    </RNAnimated.View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
  },
  60: {
    transform: [{ scale: 1.2 }],
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(1.2),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
  },
  60: {
    transform: [{ scale: 1.2 }],
    opacity: 0,
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(1.2),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '-180deg' }, { scale: 0.8 }],
    opacity: 0,
  },
  [DURATION / 1000]: {
    transform: [{ rotateZ: '0deg' }, { scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(0.7),
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View style={styles.background} entering={keyframe.duration(DURATION)}>
        <div className={classes.expoLogoBackground} />
      </Animated.View>

      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    // GRATEAPEX logo background blue.
    backgroundColor: '#1245C4',
    // Depth behind the (unchanged) intro. The logo image carries its own
    // flat logo-blue background, so everything within 300px of the centre
    // stays exactly logo blue (no visible square); only the outer edges
    // deepen into the Apex field, with soft light in the top-left corner.
    ...({
      backgroundImage:
        'radial-gradient(32% 30% at 0% 0%, rgba(96, 144, 255, 0.26), transparent), ' +
        'radial-gradient(circle at 50% 50%, transparent 0px, transparent 300px, rgba(4, 18, 63, 0.6) 1000px)',
    } as object),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    // The spinning energy arcs are square boxes with round corners; their
    // invisible corners must not widen the page (a brief sideways scroll on
    // phones). Everything visible is well inside the screen, so this
    // changes nothing on screen.
    overflow: 'hidden',
  },
  splashLogo: {
    width: '100%',
    height: '100%',
  },
  logoStage: {
    width: '88%',
    maxWidth: 440,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImageFrame: {
    width: '85%',
    height: '85%',
  },
  energyArc: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    borderWidth: 2,
  },
  goldArc: {
    borderColor: '#FFCC33',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  whiteArc: {
    width: '91%',
    height: '91%',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  apexPulse: {
    position: 'absolute',
    top: '19%',
    left: '42%',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFE07A',
  },
  energySpark: {
    position: 'absolute',
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  goldSparkOne: {
    top: '7%',
    left: '24%',
    transform: [{ rotate: '32deg' }],
  },
  goldSparkTwo: {
    top: '72%',
    right: '7%',
    height: 15,
    transform: [{ rotate: '46deg' }],
  },
  goldSparkThree: {
    bottom: '6%',
    left: '30%',
    height: 12,
    transform: [{ rotate: '-30deg' }],
  },
  container: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
    position: 'absolute',
    top: 128 / 2 + 138,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
  },
  image: {
    position: 'absolute',
    width: 76,
    height: 71,
  },
  background: {
    width: 128,
    height: 128,
    position: 'absolute',
  },
});
