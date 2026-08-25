// import React, { useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   BackHandler,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Toast from 'react-native-toast-message';

// import {
//   ScreenScaffold,
//   CircularBackButton,
//   ScreenHeader,
//   FormField,
//   PrimaryPillButton,
// } from '../../components/ui';
// import { wp, hp } from '../../utils/responsive';

// import { createTeamApi } from '../../services/teamService';

// const CreateTeamScreen = ({ navigation, route }) => {
//   const [teamName, setTeamName] = useState('');
//   const [teamMotto, setTeamMotto] = useState('');
//   const [country, setCountry] = useState('Australia');
//   const [state, setState] = useState('VIC');
//   const [city, setCity] = useState('Melbourne');
//   const [loading, setLoading] = useState(false);

//   useFocusEffect(
//     React.useCallback(() => {
//       const onBackPress = () => {
//         navigation.goBack();
//         return true;
//       };

//       const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//       return () => subscription.remove();
//     }, [navigation])
//   );

//   const handleCreateTeam = async () => {
//     if (!teamName.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Validation Error',
//         text2: 'Please enter a team name.',
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         name: teamName.trim(),
//         description: teamMotto.trim() || 'Golf Squad',
//         country: country.trim() || 'Australia',
//         state: state.trim() || 'VIC',
//         city: city.trim() || 'Melbourne',
//       };

//       const res = await createTeamApi(payload);
//       const createdTeam = res?.team || res?.data?.team || res?.data || res;
//       const createdTeamId = createdTeam?.id || createdTeam?._id;

//       Toast.show({
//         type: 'success',
//         text1: 'Success',
//         text2: 'Team created successfully!',
//       });

//       // Clear form inputs
//       setTeamName('');
//       setTeamMotto('');

//       // Navigate to AddPlayers screen so user can select team members
//       navigation.navigate('AddPlayers', {
//         ...route?.params,
//         newTeam: {
//           id: createdTeamId,
//           name: createdTeam?.name || teamName.trim(),
//           description: createdTeam?.description || teamMotto.trim(),
//           location: `${payload.city}, ${payload.state}`,
//           creatorUserId: createdTeam?.creatorUserId || createdTeam?.creatorId,
//         },
//       });
//     } catch (error) {
//       console.log('Create team error:', error);
//       const errMsg =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         error?.message ||
//         'Could not create team. Please try again.';

//       Toast.show({
//         type: 'error',
//         text1: 'Create Team Failed',
//         text2: errMsg,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScreenScaffold edges={['top', 'bottom']} showDots>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

//       <View style={styles.headerBlock}>
//         <CircularBackButton onPress={() => navigation.goBack()} />
//         <ScreenHeader title="Create Team" subtitle="Build your dream squad" />
//       </View>

//       <ScrollView
//         style={styles.formContainer}
//         contentContainerStyle={styles.formScrollContent}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//       >
//         <FormField
//           label="Team name"
//           placeholder="e.g. Mighty Players"
//           value={teamName}
//           onChangeText={setTeamName}
//         />

//         <FormField
//           label="Team motto"
//           placeholder="Drive for show, putt for dough"
//           value={teamMotto}
//           onChangeText={setTeamMotto}
//           multiline
//         />

//         <PrimaryPillButton
//           title="CREATE TEAM"
//           loading={loading}
//           onPress={handleCreateTeam}
//           style={styles.submitBtn}
//         />
//       </ScrollView>
//     </ScreenScaffold>
//   );
// };

// const styles = StyleSheet.create({
//   headerBlock: {
//     paddingHorizontal: wp(6),
//     paddingTop: hp(1.5),
//     paddingBottom: hp(0.5),
//   },
//   formContainer: {
//     flex: 1,
//     paddingHorizontal: wp(6),
//   },
//   formScrollContent: {
//     paddingTop: hp(2.5),
//     paddingBottom: hp(6),
//   },
//   submitBtn: {
//     marginTop: hp(3),
//     marginBottom: hp(2),
//   },
// });

// export default CreateTeamScreen;


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';

import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import {
  wp,
  hp,
  fontSize,
  moderateScale,
} from '../../utils/responsive';

import { createTeamApi } from '../../services/teamService';


const CreateTeamScreen = ({ navigation, route }) => {
  const [teamName, setTeamName] = useState('');
  const [teamMotto, setTeamMotto] = useState('');
  const [country, setCountry] = useState('Australia');
  const [state, setState] = useState('VIC');
  const [city, setCity] = useState('Melbourne');
  const [loading, setLoading] = useState(false);


  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );


  const handleCreateTeam = async () => {
    // ─────────────────────────────────────────────
    // Validation
    // ─────────────────────────────────────────────
    if (!teamName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a team name.',
      });
      return;
    }


    setLoading(true);

    try {
      // ─────────────────────────────────────────────
      // Same payload/API functionality as new code
      // ─────────────────────────────────────────────
      const payload = {
        name: teamName.trim(),
        description: teamMotto.trim() || 'Golf Squad',
        country: country.trim() || 'Australia',
        state: state.trim() || 'VIC',
        city: city.trim() || 'Melbourne',
      };


      const res = await createTeamApi(payload);


      // Same team extraction as new/uncommented code
      const createdTeam =
        res?.team ||
        res?.data?.team ||
        res?.data ||
        res;


      const createdTeamId =
        createdTeam?.id ||
        createdTeam?._id;


      // ─────────────────────────────────────────────
      // Success Toast
      // ─────────────────────────────────────────────
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Team created successfully!',
      });


      // ─────────────────────────────────────────────
      // Clear form
      // ─────────────────────────────────────────────
      setTeamName('');
      setTeamMotto('');


      // ─────────────────────────────────────────────
      // Navigate to AddPlayers (replace CreateTeam so back navigation doesn't loop)
      // ─────────────────────────────────────────────
      navigation.replace('AddPlayers', {
        ...route?.params,

        newTeam: {
          id: createdTeamId,
          name: createdTeam?.name || teamName.trim(),
          description:
            createdTeam?.description ||
            teamMotto.trim(),

          location: `${payload.city}, ${payload.state}`,

          creatorUserId:
            createdTeam?.creatorUserId ||
            createdTeam?.creatorId,
        },
      });
    } catch (error) {
      console.log('Create team error:', error);

      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Could not create team. Please try again.';


      Toast.show({
        type: 'error',
        text1: 'Create Team Failed',
        text2: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />


      {/* ─────────────────────────────────────────
          Header
      ───────────────────────────────────────── */}
      <View style={styles.headerBlock}>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AuthIcon
            name="chevron-left"
            size={moderateScale(22)}
            color="#093A24"
          />
        </TouchableOpacity>


        {/* Header Text */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Create Team
          </Text>

          <Text style={styles.headerSubtitle}>
            Build your dream squad
          </Text>
        </View>
      </View>


      {/* ─────────────────────────────────────────
          Form
      ───────────────────────────────────────── */}
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Team Name */}
        <Text style={styles.formLabel}>
          Team name
        </Text>

        <View style={styles.formInputWrapper}>
          <TextInput
            style={styles.formTextInput}
            placeholder="e.g. Mighty Players"
            placeholderTextColor="#A0AEC0"
            value={teamName}
            onChangeText={setTeamName}
            editable={!loading}
          />
        </View>


        {/* Team Motto */}
        <Text style={styles.formLabel}>
          Team motto
        </Text>

        <View
          style={[
            styles.formInputWrapper,
            styles.multilineWrapper,
          ]}
        >
          <TextInput
            style={[
              styles.formTextInput,
              styles.multilineInput,
            ]}
            placeholder="Drive for show, putt for dough"
            placeholderTextColor="#A0AEC0"
            value={teamMotto}
            onChangeText={setTeamMotto}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>


        {/* Create Team Button */}
        <AuthButton
          title="CREATE TEAM"
          loading={loading}
          onPress={handleCreateTeam}
          style={styles.submitButton}
        />

      </ScrollView>
    </SafeAreaView>
  );
};


/* ─────────────────────────────────────────────
   Styles
   UI copied from previous commented version
   ───────────────────────────────────────────── */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },


  // ─────────────────────────────────────────
  // Header
  // ─────────────────────────────────────────

  headerBlock: {
    paddingHorizontal: wp(6),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.5),
  },

  backButtonCircle: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: COLORS.white,

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 4,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,

    marginBottom: hp(2.5),
  },

  headerTextContainer: {
    marginTop: hp(1),
  },

  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(30),
    color: '#093A24',
  },

  headerSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: '#718096',
    marginTop: hp(0.5),
  },


  // ─────────────────────────────────────────
  // Form
  // ─────────────────────────────────────────

  formContainer: {
    flex: 1,
    paddingHorizontal: wp(6),
  },

  formScrollContent: {
    paddingTop: hp(1.5),
    paddingBottom: hp(6),
  },


  // ─────────────────────────────────────────
  // Labels
  // ─────────────────────────────────────────

  formLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(13),
    color: '#093A24',
    marginBottom: hp(0.8),
    marginTop: hp(2.2),
  },


  // ─────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────

  formInputWrapper: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(12),

    height: hp(6),

    backgroundColor: COLORS.white,

    paddingHorizontal: wp(4),

    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.02,
    shadowRadius: 4,

    elevation: 1,
  },

  formTextInput: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13),
    color: '#093A24',

    flex: 1,
    padding: 0,
  },


  // ─────────────────────────────────────────
  // Motto multiline input
  // ─────────────────────────────────────────

  multilineWrapper: {
    height: hp(14),
    paddingVertical: hp(1.2),
  },

  multilineInput: {
    textAlignVertical: 'top',
    flex: 1,
  },


  // ─────────────────────────────────────────
  // Button
  // ─────────────────────────────────────────

  submitButton: {
    marginTop: hp(4),
    marginBottom: hp(3),
  },
});


export default CreateTeamScreen;