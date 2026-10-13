import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AuthIcon from '../common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { formatShotDistance, haversineMeters } from '../../utils/geo';
import { captureGeoFix, watchGeoPosition } from '../../utils/captureGeoFix';
import { recordShotDistanceApi } from '../../services/playService';

/**
 * Drive-to-ball: live distance from Start fix while walking; Stop saves to API.
 */
const ShotDistanceBar = ({
  tournamentId,
  sessionId,
  holeNumber,
  shotNumber,
  shotDistanceMeters,
  disabled,
  onPlayUpdated,
}) => {
  const [phase, setPhase] = useState('idle'); // idle | measuring | saving
  const [error, setError] = useState(null);
  const [liveMeters, setLiveMeters] = useState(null);
  const startFixRef = useRef(null);
  const stopWatchRef = useRef(null);
  const holeShotKey = `${holeNumber}-${shotNumber}`;

  const stopWatching = useCallback(() => {
    if (stopWatchRef.current) {
      stopWatchRef.current();
      stopWatchRef.current = null;
    }
  }, []);

  useEffect(() => {
    startFixRef.current = null;
    stopWatching();
    setLiveMeters(null);
    setPhase('idle');
    setError(null);
  }, [holeShotKey, stopWatching]);

  useEffect(() => {
    if (phase !== 'measuring' || !startFixRef.current) {
      stopWatching();
      return undefined;
    }

    stopWatchRef.current = watchGeoPosition((current) => {
      const start = startFixRef.current;
      if (!start) return;
      const meters = haversineMeters(start, current);
      if (Number.isFinite(meters)) {
        setLiveMeters(meters);
      }
    });

    return () => {
      stopWatching();
    };
  }, [phase, stopWatching]);

  const handleStart = useCallback(async () => {
    setError(null);
    setLiveMeters(null);
    setPhase('saving');
    try {
      startFixRef.current = await captureGeoFix();
      setLiveMeters(0);
      setPhase('measuring');
    } catch (e) {
      setError(e?.message || 'Could not get GPS fix.');
      setPhase('idle');
    }
  }, []);

  const handleCancel = useCallback(() => {
    stopWatching();
    startFixRef.current = null;
    setLiveMeters(null);
    setPhase('idle');
    setError(null);
  }, [stopWatching]);

  const handleStop = useCallback(async () => {
    const startFix = startFixRef.current;
    if (!startFix) {
      setError('Tap Start calculating first, at your shot location.');
      setPhase('idle');
      return;
    }
    setError(null);
    stopWatching();
    setPhase('saving');
    try {
      const endFix = await captureGeoFix();
      const res = await recordShotDistanceApi(tournamentId, sessionId, {
        holeNumber,
        shotNumber,
        startLat: startFix.lat,
        startLng: startFix.lng,
        endLat: endFix.lat,
        endLng: endFix.lng,
        startAccuracyMeters: startFix.accuracyMeters ?? undefined,
        endAccuracyMeters: endFix.accuracyMeters ?? undefined,
      });
      const payload = res?.data || res;
      if (payload?.play && onPlayUpdated) {
        onPlayUpdated(payload.play);
      }
      startFixRef.current = null;
      setLiveMeters(null);
      setPhase('idle');
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        'Could not save shot distance.';
      setError(msg);
      setPhase('measuring');
      stopWatchRef.current = watchGeoPosition((current) => {
        const start = startFixRef.current;
        if (!start) return;
        const meters = haversineMeters(start, current);
        if (Number.isFinite(meters)) setLiveMeters(meters);
      });
    }
  }, [tournamentId, sessionId, holeNumber, shotNumber, onPlayUpdated, stopWatching]);

  const hasResult =
    shotDistanceMeters != null && Number(shotDistanceMeters) > 0;

  const showLive = phase === 'measuring' && liveMeters != null;

  const statusText = showLive
    ? formatShotDistance(liveMeters)
    : phase === 'measuring'
      ? 'Getting GPS…'
      : hasResult
        ? formatShotDistance(shotDistanceMeters)
        : 'Measure this shot';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          <View style={styles.iconCircle}>
            <AuthIcon name="target" size={moderateScale(15)} color="#093A24" />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.label}>SHOT DISTANCE</Text>
            {showLive ? (
              <Text style={styles.liveHint}>Live — walk to your ball</Text>
            ) : (
              <Text style={styles.subText} numberOfLines={2}>
                {phase === 'measuring'
                  ? 'Walk to your ball, then tap Stop'
                  : 'Tap Start at your shot location'}
              </Text>
            )}
          </View>
        </View>
        <Text style={[styles.liveValue, showLive && styles.liveValueActive]}>
          {statusText}
        </Text>
      </View>

      {phase === 'saving' ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#BCFF00" />
          <Text style={styles.loadingText}>Please wait…</Text>
        </View>
      ) : phase === 'measuring' ? (
        <View style={styles.btnCol}>
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={() => void handleStop()}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <Text style={styles.stopBtnText}>Stop calculating</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => void handleStart()}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Start calculating</Text>
        </TouchableOpacity>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {phase === 'idle' && !hasResult ? (
        <Text style={styles.hint}>
          Distance updates in real time after Start until you tap Stop.
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#093A24',
    borderRadius: moderateScale(16),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    marginHorizontal: wp(5),
    marginTop: hp(1.5),
    borderWidth: 1.5,
    borderColor: '#BCFF00',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(2),
    marginBottom: hp(1),
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
    flex: 1,
  },
  iconCircle: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#BCFF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11),
    color: '#BCFF00',
  },
  subText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),
    color: 'rgba(255,255,255,0.75)',
    marginTop: hp(0.2),
  },
  liveHint: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(10),
    color: '#BCFF00',
    marginTop: hp(0.2),
  },
  liveValue: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'right',
    maxWidth: wp(38),
  },
  liveValueActive: {
    fontSize: fontSize(20),
    color: COLORS.white,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: wp(2),
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),
    color: 'rgba(255,255,255,0.7)',
  },
  startBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(5),
    paddingVertical: hp(0.9),
  },
  startBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: '#093A24',
  },
  btnCol: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: wp(2),
  },
  stopBtn: {
    backgroundColor: '#BCFF00',
    borderRadius: moderateScale(12),
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.9),
  },
  stopBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
    color: '#093A24',
  },
  cancelBtn: {
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.9),
  },
  cancelBtnText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(11),
    color: COLORS.white,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11),
    color: '#FCA5A5',
    marginTop: hp(0.6),
  },
  hint: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(10),
    color: 'rgba(255,255,255,0.55)',
    marginTop: hp(0.5),
  },
});

export default ShotDistanceBar;
