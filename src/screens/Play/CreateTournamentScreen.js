import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
  StatusBar,
  BackHandler,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { createTournamentApi, updateTournamentApi, getTournamentByIdApi, getClubsApi, getStatesApi } from '../../services/homeService';
import { getCourseCountriesApi, getPlayerProfileApi } from '../../services/playerService';

import AuthButton from '../../components/common/AuthButton';
import AuthIcon from '../../components/common/AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';
import { formatDisplayDate } from '../../utils/dateUtils';

const tournamentBg = require('../../assets/Images/tournament_bg.jpg');

const formatDateString = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const KNOWN_CITIES = new Set([
  'jaipur', 'dehradun', 'bareilly', 'lonavala', 'patna', 'deolali', 'new delhi',
  'jabalpur', 'pithoragarh', 'alwar', 'agra', 'gwalior', 'gurgaon', 'gurugram',
  'inayatpur', 'bengaluru', 'bangalore', 'ambala', 'sri ganganagar', 'faridabad',
  'mathura', 'patiala', 'allahabad', 'dera bassi', 'rupa', 'belagavi', 'belgaum',
  'shantigram', 'secunderabad', 'bhatinda', 'bathinda', 'bhubaneswar', 'tezpur',
  'pune', 'varanasi', 'mumbai', 'hyderabad', 'agartala', 'bagma', 'ranchi',
  'akhnoor cantt', 'srinagar', 'kochi', 'navi mumbai', 'coimbatore', 'chennai',
  'greater noida', 'dwarka', 'udhampur', 'mullanpur', 'jamnagar', 'jamshedpur',
  'kolkata', 'noida', 'indore', 'bhopal', 'lucknow', 'kanpur', 'surat',
  'ahmedabad', 'vadodara', 'mysore', 'mysuru', 'mangalore', 'mangaluru', 'shimla',
  'solan', 'dharamshala', 'haridwar', 'rishikesh', 'roorkee', 'ghaziabad', 'meerut',
]);

const STATE_ABBR_MAP = {
  up: 'Uttar Pradesh',
  mh: 'Maharashtra',
  mah: 'Maharashtra',
  hr: 'Haryana',
  dl: 'Delhi',
  ncr: 'Delhi',
  ka: 'Karnataka',
  kar: 'Karnataka',
  pb: 'Punjab',
  pun: 'Punjab',
  bih: 'Bihar',
  as: 'Assam',
  ass: 'Assam',
  mp: 'Madhya Pradesh',
  ap: 'Andhra Pradesh',
  ts: 'Telangana',
  tel: 'Telangana',
  tn: 'Tamil Nadu',
  uk: 'Uttarakhand',
  wb: 'West Bengal',
  rj: 'Rajasthan',
  gj: 'Gujarat',
  or: 'Odisha',
  kl: 'Kerala',
  hp: 'Himachal Pradesh',
  jk: 'Jammu and Kashmir',
  cg: 'Chhattisgarh',
};

const CITY_TO_STATE_MAP = {
  dehradun: 'Uttarakhand',
  pithoragarh: 'Uttarakhand',
  roorkee: 'Uttarakhand',
  haridwar: 'Uttarakhand',
  rishikesh: 'Uttarakhand',
  jaipur: 'Rajasthan',
  alwar: 'Rajasthan',
  'sri ganganagar': 'Rajasthan',
  bareilly: 'Uttar Pradesh',
  agra: 'Uttar Pradesh',
  mathura: 'Uttar Pradesh',
  varanasi: 'Uttar Pradesh',
  meerut: 'Uttar Pradesh',
  'greater noida': 'Uttar Pradesh',
  noida: 'Uttar Pradesh',
  ghaziabad: 'Uttar Pradesh',
  allahabad: 'Uttar Pradesh',
  kanpur: 'Uttar Pradesh',
  lucknow: 'Uttar Pradesh',
  patna: 'Bihar',
  gaya: 'Bihar',
  deolali: 'Maharashtra',
  lonavala: 'Maharashtra',
  pune: 'Maharashtra',
  mumbai: 'Maharashtra',
  'navi mumbai': 'Maharashtra',
  nashik: 'Maharashtra',
  jabalpur: 'Madhya Pradesh',
  gwalior: 'Madhya Pradesh',
  mhow: 'Madhya Pradesh',
  indore: 'Madhya Pradesh',
  bhopal: 'Madhya Pradesh',
  bengaluru: 'Karnataka',
  bangalore: 'Karnataka',
  belagavi: 'Karnataka',
  belgaum: 'Karnataka',
  abatty: 'Karnataka',
  mysore: 'Karnataka',
  mysuru: 'Karnataka',
  gurgaon: 'Haryana',
  gurugram: 'Haryana',
  ambala: 'Haryana',
  faridabad: 'Haryana',
  secunderabad: 'Telangana',
  hyderabad: 'Telangana',
  bhatinda: 'Punjab',
  bathinda: 'Punjab',
  patiala: 'Punjab',
  amritsar: 'Punjab',
  ferozepur: 'Punjab',
  bhubaneswar: 'Odisha',
  ranchi: 'Jharkhand',
  jamshedpur: 'Jharkhand',
  tezpur: 'Assam',
  tinsukia: 'Assam',
  chabua: 'Assam',
  chennai: 'Tamil Nadu',
  coimbatore: 'Tamil Nadu',
  kochi: 'Kerala',
  agartala: 'Tripura',
  bagma: 'Tripura',
  jammu: 'Jammu and Kashmir',
  srinagar: 'Jammu and Kashmir',
  akhnoor: 'Jammu and Kashmir',
  rupa: 'Arunachal Pradesh',
  kolkata: 'West Bengal',
};

const normalizeStateName = (rawState, rawCity = '') => {
  if (rawState && typeof rawState === 'string') {
    const trimmed = rawState.trim();
    const lower = trimmed.toLowerCase();

    if (KNOWN_CITIES.has(lower)) {
      if (CITY_TO_STATE_MAP[lower]) {
        return CITY_TO_STATE_MAP[lower];
      }
    } else if (STATE_ABBR_MAP[lower]) {
      return STATE_ABBR_MAP[lower];
    } else {
      const matched = INDIAN_STATES.find(
        (s) => s.toLowerCase() === lower || lower.includes(s.toLowerCase())
      );
      if (matched) return matched;
      if (!KNOWN_CITIES.has(lower)) {
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      }
    }
  }

  if (rawCity && typeof rawCity === 'string') {
    const cityLower = rawCity.trim().toLowerCase();
    for (const [c, st] of Object.entries(CITY_TO_STATE_MAP)) {
      if (cityLower.includes(c)) {
        return st;
      }
    }
  }

  return null;
};

const CreateTournamentScreen = ({ navigation, route }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id || currentUser?._id;

  const tournamentParam = route?.params?.tournament;
  const isEditing = Boolean(route?.params?.isEditing || (tournamentParam && (tournamentParam.id || tournamentParam._id)));
  const editingTournamentId = tournamentParam?.id || tournamentParam?._id;

  const [tournamentName, setTournamentName] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('Select Country');
  const [golfClub, setGolfClub] = useState('Select Golf Club');
  const [golfClubId, setGolfClubId] = useState('');
  const [clubHasMap, setClubHasMap] = useState(null);
  const [clubsList, setClubsList] = useState([]);
  const [countriesList, setCountriesList] = useState(['Australia', 'USA', 'UK', 'New Zealand']);
  const [state, setState] = useState('Select State');
  const [statesList, setStatesList] = useState([]);
  const [suburb, setSuburb] = useState('');
  const [tournamentNameError, setTournamentNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [golfClubError, setGolfClubError] = useState('');
  const [stateError, setStateError] = useState('');
  const [suburbError, setSuburbError] = useState('');
  const [city, setCity] = useState('');
  const [cityError, setCityError] = useState('');
  const [additionalDesc, setAdditionalDesc] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorNameError, setSponsorNameError] = useState('');
  const [tournamentPrize, setTournamentPrize] = useState('');
  const [tournamentPrizeError, setTournamentPrizeError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allowInvites, setAllowInvites] = useState(true);
  const [shareLink, setShareLink] = useState(true);
  const [inviteStatus, setInviteStatus] = useState('Invite only');
  const [numberOfGames, setNumberOfGames] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Dropdown UI state
  const [activeDropdown, setActiveDropdown] = useState(null); // 'country', 'golfClub', 'state', 'inviteStatus', 'games'
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [dropdownCallback, setDropdownCallback] = useState(null);
  const [dropdownSearchQuery, setDropdownSearchQuery] = useState('');
  const countryInitialized = React.useRef(false);
  const isEditingPrefilled = React.useRef(false);
  const prevCountryRef = React.useRef(country);
  const prevStateRef = React.useRef(state);
  const isSelectingClubRef = React.useRef(false);

  // Countries from API + country from player profile (auto-select → clubs load)
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const [countriesRes, profileRes] = await Promise.all([
          getCourseCountriesApi().catch(() => null),
          getPlayerProfileApi().catch(() => null),
        ]);

        if (cancelled) return;

        const countries =
          countriesRes?.countries ||
          countriesRes?.data?.countries ||
          (Array.isArray(countriesRes) ? countriesRes : []);
        const countryOptions =
          Array.isArray(countries) && countries.length > 0
            ? countries
            : ['Australia', 'USA', 'UK', 'New Zealand'];
        setCountriesList(countryOptions);

        const player =
          profileRes?.player ||
          profileRes?.data?.player ||
          profileRes?.data ||
          profileRes;
        const profileCountry = String(
          player?.country || currentUser?.country || '',
        ).trim();

        if (!profileCountry) return;

        const matched =
          countryOptions.find(
            (c) => String(c).toLowerCase() === profileCountry.toLowerCase(),
          ) || profileCountry;

        countryInitialized.current = true;
        setCountry(matched);
      } catch (err) {
        console.log('Create tournament bootstrap error:', err);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.country]);

  // Pre-fill fields if editing an existing tournament
  useEffect(() => {
    let active = true;

    if (isEditing && tournamentParam) {
      const status = String(tournamentParam.status || '').toUpperCase();
      if (
        status === 'IN_PROGRESS' ||
        status === 'COMPLETED' ||
        status === 'CANCELLED' ||
        tournamentParam.isStarted === true ||
        tournamentParam.hasStarted === true
      ) {
        Toast.show({
          type: 'info',
          text1: 'Editing Disabled',
          text2: 'Editing is disabled once tournament games have started.',
        });
        navigation.goBack();
        return;
      }

      isEditingPrefilled.current = true;

      setTournamentName(tournamentParam.name || tournamentParam.title || '');
      setDescription(tournamentParam.description || '');
      setSponsorName(tournamentParam.sponsor || '');
      setTournamentPrize(tournamentParam.prize || '');

      if (tournamentParam.startDate) {
        try {
          const d = new Date(tournamentParam.startDate);
          if (!isNaN(d.getTime())) {
            setStartDate(formatDateString(d));
            setSelectedDate(d);
          } else {
            setStartDate(String(tournamentParam.startDate));
          }
        } catch (_) {
          setStartDate(String(tournamentParam.startDate));
        }
      }

      if (tournamentParam.country) setCountry(tournamentParam.country);
      if (tournamentParam.state) setState(tournamentParam.state);
      const loc = tournamentParam.suburb || tournamentParam.city || '';
      if (loc) {
        setSuburb(loc);
        setCity(loc);
      }
      if (tournamentParam.clubName || tournamentParam.location) {
        setGolfClub(tournamentParam.clubName || tournamentParam.location);
      }
      if (tournamentParam.clubId) {
        setGolfClubId(tournamentParam.clubId);
      }
      if (tournamentParam.numberOfGames) {
        setNumberOfGames(String(tournamentParam.numberOfGames));
      }
      if (tournamentParam.inviteStatus) {
        setInviteStatus(
          tournamentParam.inviteStatus === 'OPEN' || tournamentParam.inviteStatus === 'Open to all'
            ? 'Open to all'
            : 'Invite only'
        );
      }
      if (typeof tournamentParam.invitesEnabled === 'boolean') {
        setAllowInvites(tournamentParam.invitesEnabled);
      }
      if (typeof tournamentParam.shareLinkEnabled === 'boolean') {
        setShareLink(tournamentParam.shareLinkEnabled);
      }

      if (editingTournamentId) {
        getTournamentByIdApi(editingTournamentId)
          .then((res) => {
            if (!active) return;
            const fullT = res?.tournament || res?.data?.tournament || res?.data || res;
            if (fullT) {
              if (fullT.name || fullT.title) setTournamentName(fullT.name || fullT.title);
              if (fullT.description) setDescription(fullT.description);
              if (fullT.sponsor) setSponsorName(fullT.sponsor);
              if (fullT.prize) setTournamentPrize(fullT.prize);
              if (fullT.country) setCountry(fullT.country);
              if (fullT.state) setState(fullT.state);
              const fullLoc = fullT.suburb || fullT.city || '';
              if (fullLoc) {
                setSuburb(fullLoc);
                setCity(fullLoc);
              }
              if (fullT.clubName || fullT.location) {
                setGolfClub(fullT.clubName || fullT.location);
              }
              if (fullT.clubId) {
                setGolfClubId(fullT.clubId);
              }
            }
          })
          .catch((err) => console.log('Error fetching tournament details:', err));
      }
    }

    return () => {
      active = false;
    };
  }, [tournamentParam, isEditing, editingTournamentId]);

  // Fetch states when country is selected
  const loadStates = async (countryFilter) => {
    if (!countryFilter || countryFilter === 'Select Country') {
      setStatesList([]);
      return;
    }
    try {
      const res = await getStatesApi(countryFilter);
      const states = res?.states || res?.data?.states || res?.data || (Array.isArray(res) ? res : []);
      const formatted = (Array.isArray(states) ? states : [])
        .map((s) => (typeof s === 'object' ? s.name || s.state || s.label : String(s)))
        .map((s) => normalizeStateName(s))
        .filter((s) => !!s);

      const uniqueStates = Array.from(new Set(formatted)).sort();

      if (uniqueStates.length > 0) {
        setStatesList(uniqueStates);
      } else if (countryFilter.toLowerCase().includes('india')) {
        setStatesList(INDIAN_STATES.slice().sort());
      } else if (countryFilter.toLowerCase().includes('australia')) {
        setStatesList(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']);
      } else {
        setStatesList(uniqueStates);
      }
    } catch (err) {
      console.log('Error fetching states:', err);
      if (countryFilter.toLowerCase().includes('india')) {
        setStatesList(INDIAN_STATES.slice().sort());
      } else if (countryFilter.toLowerCase().includes('australia')) {
        setStatesList(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']);
      } else {
        setStatesList([]);
      }
    }
  };

  // Fetch clubs based on country and state: /api/v1/mobile/courses/clubs?country={country}&state={state}
  const loadClubs = async (countryFilter, stateFilter) => {
    try {
      const params = { limit: 100 };
      if (countryFilter && countryFilter !== 'Select Country') {
        params.country = countryFilter;
      }
      if (stateFilter && stateFilter !== 'Select State') {
        params.state = stateFilter;
      }
      const res = await getClubsApi(params);
      const clubs = res?.clubs || res?.data?.clubs || (Array.isArray(res) ? res : []);
      setClubsList(Array.isArray(clubs) ? clubs : []);
    } catch (err) {
      console.log('Error fetching dynamic clubs:', err);
      setClubsList([]);
    }
  };

  useEffect(() => {
    if (country && country !== 'Select Country') {
      loadStates(country);

      if (isEditingPrefilled.current) {
        isEditingPrefilled.current = false;
        loadClubs(country, state !== 'Select State' ? state : undefined);
      } else if (prevCountryRef.current && prevCountryRef.current !== country) {
        setState('Select State');
        setGolfClub('Select Golf Club');
        setGolfClubId('');
        setClubHasMap(null);
        setSuburb('');
        setCity('');
        setStateError('');
        setGolfClubError('');
        setSuburbError('');
        loadClubs(country);
      } else {
        loadClubs(country, state !== 'Select State' ? state : undefined);
      }

      countryInitialized.current = false;
      prevCountryRef.current = country;
    }
  }, [country]);

  useEffect(() => {
    if (country && country !== 'Select Country' && state && state !== 'Select State') {
      if (isSelectingClubRef.current) {
        isSelectingClubRef.current = false;
      } else if (prevStateRef.current && prevStateRef.current !== state) {
        setGolfClub('Select Golf Club');
        setGolfClubId('');
        setClubHasMap(null);
        setSuburb('');
        setCity('');
        setGolfClubError('');
        setSuburbError('');
      }
      loadClubs(country, state);
      prevStateRef.current = state;
    }
  }, [state]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const handleOpenDropdown = (type, currentOptions, setter) => {
    setDropdownSearchQuery('');
    setDropdownOptions(currentOptions);
    setDropdownCallback(() => (val) => {
      setter(val);
      if (type === 'country') setCountryError('');
      if (type === 'state') setStateError('');
    });
    setActiveDropdown(type);
  };

  // Open dynamic State dropdown based on selected Country
  const handleOpenStateDropdown = () => {
    if (!country || country === 'Select Country') {
      Toast.show({
        type: 'info',
        text1: 'Select Country First',
        text2: 'Choose a country so we can load states.',
      });
      return;
    }

    const options = statesList.length > 0 ? statesList : ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS'];
    handleOpenDropdown('state', options, (val) => {
      setState(val);
      setStateError('');
      // When user manually picks a new state from State dropdown, reset Golf Club & Suburb/City
      setGolfClub('Select Golf Club');
      setGolfClubId('');
      setClubHasMap(null);
      setSuburb('');
      setCity('');
      setGolfClubError('');
      setSuburbError('');
    });
  };

  // Open dynamic Golf Club dropdown
  const handleOpenGolfClubDropdown = () => {
    if (!country || country === 'Select Country') {
      Toast.show({
        type: 'info',
        text1: 'Select Country First',
        text2: 'Choose a country so we can load golf clubs.',
      });
      return;
    }

    if (clubsList.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No Clubs Found',
        text2: state && state !== 'Select State'
          ? `No golf clubs available for ${state}, ${country}.`
          : `No golf clubs available for ${country}.`,
      });
      return;
    }

    const options = clubsList.map((c) => ({
      label: c.clubName || c.name || 'Golf Club',
      value: c,
      hasMap: Boolean(c.hasMap ?? c.hasGps),
    }));

    setDropdownOptions(options);
    setDropdownCallback(() => (selected) => {
      setGolfClubError('');
      isSelectingClubRef.current = true;

      const clubObj = typeof selected === 'object' && selected ? (selected.value || selected) : null;

      if (clubObj) {
        setGolfClub(clubObj.clubName || clubObj.name || 'Golf Club');
        setGolfClubId(clubObj.clubId || clubObj.id || clubObj._id || '');
        setClubHasMap(Boolean(clubObj.hasMap ?? clubObj.hasGps));

        if (clubObj.country) {
          setCountry(clubObj.country);
          setCountryError('');
        }

        const loc =
          clubObj.suburb ||
          clubObj.city ||
          clubObj.suburbName ||
          clubObj.cityName ||
          clubObj.location ||
          clubObj.address ||
          '';

        const normState = normalizeStateName(clubObj.state, loc);
        if (normState) {
          setState(normState);
          setStateError('');
        }

        if (loc) {
          setSuburb(loc);
          setCity(loc);
          setSuburbError('');
          setCityError('');
        }
      } else {
        setGolfClub(String(selected));
        const matched = clubsList.find(
          (c) =>
            (c.clubName || c.name || '').toLowerCase() ===
            String(selected).toLowerCase(),
        );
        if (matched) {
          setGolfClubId(matched.clubId || matched.id || matched._id || '');
          setClubHasMap(Boolean(matched.hasMap ?? matched.hasGps));
          const loc =
            matched.suburb ||
            matched.city ||
            matched.suburbName ||
            matched.cityName ||
            matched.location ||
            matched.address ||
            '';

          const normState = normalizeStateName(matched.state, loc);
          if (normState) {
            setState(normState);
            setStateError('');
          }
          if (loc) {
            setSuburb(loc);
            setCity(loc);
            setSuburbError('');
            setCityError('');
          }
        } else {
          setGolfClubId('');
          setClubHasMap(null);
        }
      }
    });
    setDropdownSearchQuery('');
    setActiveDropdown('golfClub');
  };

  const handleOpenDatePicker = () => {
    if (!startDate) {
      const todayStr = formatDateString(new Date());
      setStartDate(todayStr);
      setSelectedDate(new Date());
    } else {
      const parts = startDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) {
          setSelectedDate(d);
        }
      }
    }
    if (startDateError) setStartDateError('');
    setShowDatePicker(true);
  };

  const handleCreateTournament = async () => {
    setSubmissionError('');
    setTournamentNameError('');
    setDescriptionError('');
    setCountryError('');
    setGolfClubError('');
    setStateError('');
    setSuburbError('');
    setCityError('');
    setSponsorNameError('');
    setTournamentPrizeError('');
    setStartDateError('');

    let hasError = false;

    if (!tournamentName.trim()) {
      setTournamentNameError('Please enter a tournament name.');
      hasError = true;
    }
    if (!description.trim()) {
      setDescriptionError('Please enter a description.');
      hasError = true;
    }
    if (country === 'Select Country') {
      setCountryError('Please select a country.');
      hasError = true;
    }
    if (golfClub === 'Select Golf Club') {
      setGolfClubError('Please select a golf club.');
      hasError = true;
    }
    const locationVal = (suburb || city).trim();
    if (!locationVal) {
      setSuburbError('Please enter suburb / city.');
      hasError = true;
    }
    if (!sponsorName.trim()) {
      setSponsorNameError('Please enter a sponsor name.');
      hasError = true;
    }
    if (!tournamentPrize.trim()) {
      setTournamentPrizeError('Please enter a tournament prize.');
      hasError = true;
    }
    if (!startDate.trim()) {
      setStartDateError('Please select a start date.');
      hasError = true;
    }

    if (hasError) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const mapInviteStatus = (status) => {
        if (status === 'Open to all') return 'OPEN';
        if (status === 'Invite only') return 'INVITE_ONLY';
        return 'INVITE_ONLY';
      };

      const rawPlayMode = isEditing
        ? (tournamentParam?.playMode || tournamentParam?.mode || route?.params?.playMode)
        : route?.params?.playMode;
      const playModeParam = String(rawPlayMode || 'PRACTICE').toUpperCase().includes('CHALLENGE')
        ? 'CHALLENGE'
        : 'PRACTICE';
      // Admin mobile-flow: Practice defaults to teamSize 5; Challenge uses selected size
      const teamSizeParam = tournamentParam?.teamSize
        ? parseInt(tournamentParam.teamSize, 10)
        : route?.params?.teamSize
          ? parseInt(route.params.teamSize, 10)
          : playModeParam === 'PRACTICE'
            ? 5
            : 4;

      const matchedClub = clubsList.find((c) => (c.clubName || c.name || '').toLowerCase() === String(golfClub).toLowerCase());
      const resolvedClubId = golfClubId || matchedClub?.clubId || matchedClub?.id || matchedClub?._id || '';
      const resolvedClubName = golfClub && golfClub !== 'Select Golf Club' ? golfClub : (matchedClub?.clubName || matchedClub?.name || '');

      if (!resolvedClubId) {
        Toast.show({
          type: 'error',
          text1: 'Golf Club Required',
          text2: 'Please select a valid golf club before creating the tournament.',
        });
        setGolfClubError('Please select a golf club.');
        setSubmitting(false);
        return;
      }

      const payload = {
        name: tournamentName.trim(),
        description: description.trim(),
        sponsor: sponsorName.trim(),
        prize: tournamentPrize.trim(),
        startDate: startDate.trim(),
        inviteStatus: mapInviteStatus(inviteStatus),
        playMode: playModeParam,
        invitesEnabled: !!allowInvites,
        shareLinkEnabled: !!shareLink,
        teamSize: teamSizeParam,
        numberOfGames: parseInt(numberOfGames, 10) || 1,
        country: country !== 'Select Country' ? country : (matchedClub?.country || 'Australia'),
        state: state !== 'Select State' ? state : (matchedClub?.state || ''),
        city: locationVal,
        suburb: locationVal,
        clubId: String(resolvedClubId),
        clubName: String(resolvedClubName),
      };

      console.log('====== SAVE TOURNAMENT PAYLOAD ======');
      console.log(JSON.stringify(payload, null, 2));
      console.log('======================================');

      let res;
      if (isEditing && editingTournamentId) {
        // PATCH request to /api/v1/mobile/tournaments/{id}
        res = await updateTournamentApi(editingTournamentId, payload);
      } else {
        // POST request to /api/v1/mobile/tournaments
        res = await createTournamentApi(payload);
      }

      setStartDateError('');
      setTournamentNameError('');
      setCountryError('');
      setGolfClubError('');
      setStateError('');
      setSubmissionError('');

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isEditing ? 'Tournament updated successfully!' : 'Tournament created successfully!',
      });

      const updatedTournament = res?.tournament || res?.data?.tournament || res?.data || res;
      const tournamentId = updatedTournament?.id || updatedTournament?._id || editingTournamentId;

      const formattedT = {
        ...updatedTournament,
        id: tournamentId,
        creatorUserId: updatedTournament?.creatorUserId || currentUserId,
        isCreator: true,
        title: updatedTournament?.name || tournamentName.trim(),
        date: updatedTournament?.startDate || startDate.trim(),
        location: updatedTournament?.clubName || golfClub,
        numberOfGames: updatedTournament?.numberOfGames || parseInt(numberOfGames, 10) || 1,
        bgImage: tournamentBg,
      };

      if (isEditing) {
        const clubWasChanged =
          tournamentParam &&
          (String(resolvedClubId) !== String(tournamentParam.clubId || tournamentParam.golfClubId) ||
            String(resolvedClubName).toLowerCase() !== String(tournamentParam.clubName || tournamentParam.golfClub || tournamentParam.location || '').toLowerCase());

        if (clubWasChanged) {
          Toast.show({
            type: 'info',
            text1: 'Golf Club Updated',
            text2: 'Please configure courses for the new golf club.',
          });
          navigation.navigate('ConfigureGames', {
            ...route?.params,
            tournament: formattedT,
            isCreator: true,
            isEditing: true,
            playMode: String(playModeParam).toLowerCase(),
          });
          return;
        }

        navigation.goBack();
      } else {
        // Reset form fields
        setTournamentName('');
        setDescription('');
        setSponsorName('');
        setTournamentPrize('');
        setStartDate('');
        setGolfClub('Select Golf Club');
        setGolfClubId('');

        // Replace route so back button on ConfigureGames does not return to form
        navigation.replace('ConfigureGames', {
          tournament: formattedT,
          isCreator: true,
          playMode: String(playModeParam).toLowerCase(),
          teamSize: teamSizeParam,
        });
      }
    } catch (error) {
      console.log('====== CREATE TOURNAMENT ERROR ======');
      console.log('Status:', error?.response?.status);
      console.log('Status Text:', error?.response?.statusText);
      console.log('Response Data:', JSON.stringify(error?.response?.data, null, 2));
      console.log('Error Message:', error?.message);
      console.log('=====================================');

      const errData = error?.response?.data || {};
      const fieldErrors = errData?.details?.fieldErrors || errData?.fieldErrors || {};

      let fieldMsg = '';
      if (typeof fieldErrors === 'object' && Object.keys(fieldErrors).length > 0) {
        const errorPairs = Object.entries(fieldErrors).map(([key, val]) => {
          const msgs = Array.isArray(val) ? val.join(', ') : String(val);
          return `${key}: ${msgs}`;
        });
        fieldMsg = errorPairs.join(' | ');
      }

      if (fieldErrors.startDate && fieldErrors.startDate.length) {
        setStartDateError(fieldErrors.startDate[0]);
      }
      if (fieldErrors.name && fieldErrors.name.length) {
        setTournamentNameError(fieldErrors.name[0]);
      }
      if (fieldErrors.description && fieldErrors.description.length) {
        setDescriptionError(fieldErrors.description[0]);
      }
      if (fieldErrors.country && fieldErrors.country.length) {
        setCountryError(fieldErrors.country[0]);
      }
      if (fieldErrors.golfClub && fieldErrors.golfClub.length) {
        setGolfClubError(fieldErrors.golfClub[0]);
      }
      if (fieldErrors.state && fieldErrors.state.length) {
        setStateError(fieldErrors.state[0]);
      }

      // Build the most informative error message possible
      const topErrorMsg =
        fieldMsg ||
        errData?.error ||
        errData?.message ||
        (errData?.details?.formErrors && errData.details.formErrors.join(', ')) ||
        (typeof errData?.details === 'string' ? errData.details : null) ||
        (typeof errData === 'string' ? errData : null) ||
        JSON.stringify(errData) ||
        error?.message ||
        'Unknown error';

      setSubmissionError(topErrorMsg);

      Toast.show({
        type: 'error',
        text1: `Error ${error?.response?.status || ''}`,
        text2: topErrorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header BG Banner */}
      <ImageBackground source={tournamentBg} style={styles.bannerHeader} resizeMode="cover">
        <View style={styles.bannerOverlay} />

        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AuthIcon name="chevron-left" size={moderateScale(22)} color="#093A24" />
        </TouchableOpacity>

        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>{isEditing ? 'Edit Tournament' : 'Create Tournament'}</Text>
        </View>
      </ImageBackground>

      {/* Scrollable Form View */}
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tournament Name */}
        <Text style={styles.formLabel}>Tournament Name</Text>
        <View style={styles.formInputWrapper}>
          <TextInput
            style={styles.formTextInput}
            placeholder="e.g. Summer Masters Cup"
            placeholderTextColor="#A0AEC0"
            value={tournamentName}
            onChangeText={(text) => {
              setTournamentName(text);
              if (tournamentNameError) setTournamentNameError('');
            }}
          />
        </View>
        {tournamentNameError ? <Text style={styles.errorText}>{tournamentNameError}</Text> : null}

        {/* Description */}
        <Text style={styles.formLabel}>Description</Text>
        <View style={[styles.formInputWrapper, styles.multilineWrapper]}>
          <TextInput
            style={[styles.formTextInput, styles.multilineInput]}
            placeholder="Describe your tournament"
            placeholderTextColor="#A0AEC0"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (descriptionError) setDescriptionError('');
            }}
          />
        </View>
        {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}

        {/* Country (Dropdown) */}
        <Text style={styles.formLabel}>Country</Text>
        <TouchableOpacity
          style={styles.formDropdownTrigger}
          onPress={() =>
            handleOpenDropdown(
              'country',
              countriesList.length > 0
                ? countriesList
                : ['Australia', 'USA', 'UK', 'New Zealand'],
              setCountry,
            )
          }
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownValueText}>{country}</Text>
          <AuthIcon
            name="chevron-left"
            size={moderateScale(14)}
            color="#093A24"
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        </TouchableOpacity>
        {countryError ? <Text style={styles.errorText}>{countryError}</Text> : null}

        {/* State & Suburb / City Row */}
        <View style={styles.formRow}>
          <View style={styles.halfColumn}>
            <Text style={styles.formLabel}>State</Text>
            <TouchableOpacity
              style={styles.formDropdownTrigger}
              onPress={handleOpenStateDropdown}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownValueText}>{state}</Text>
              <AuthIcon
                name="chevron-left"
                size={moderateScale(12)}
                color="#093A24"
                style={{ transform: [{ rotate: '-90deg' }] }}
              />
            </TouchableOpacity>
            {stateError ? <Text style={styles.errorText}>{stateError}</Text> : null}
          </View>

          <View style={styles.halfColumn}>
            <Text style={styles.formLabel}>Suburb / City</Text>
            <View style={styles.formInputWrapper}>
              <TextInput
                style={styles.formTextInput}
                placeholder="Suburb / City"
                placeholderTextColor="#A0AEC0"
                value={suburb || city}
                onChangeText={(text) => {
                  setSuburb(text);
                  setCity(text);
                  if (suburbError) setSuburbError('');
                  if (cityError) setCityError('');
                }}
              />
            </View>
            {suburbError ? <Text style={styles.errorText}>{suburbError}</Text> : null}
          </View>
        </View>

        {/* Golf Club (Dynamic Dropdown from API) */}
        <Text style={styles.formLabel}>Golf Club</Text>
        <TouchableOpacity
          style={styles.formDropdownTrigger}
          onPress={handleOpenGolfClubDropdown}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownValueText, { flex: 1 }]} numberOfLines={1}>
            {golfClub}
          </Text>
          {clubHasMap != null ? (
            <View
              style={[
                styles.mapBadge,
                clubHasMap ? styles.mapBadgeYes : styles.mapBadgeNo,
              ]}
            >
              <AuthIcon
                name="map-pin"
                size={moderateScale(11)}
                color={clubHasMap ? '#0E3B2E' : '#718096'}
              />
              <Text
                style={[
                  styles.mapBadgeText,
                  clubHasMap ? styles.mapBadgeTextYes : styles.mapBadgeTextNo,
                ]}
              >
                {clubHasMap ? 'Map' : 'No map'}
              </Text>
            </View>
          ) : null}
          <AuthIcon
            name="chevron-left"
            size={moderateScale(14)}
            color="#093A24"
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        </TouchableOpacity>
        {clubHasMap === false ? (
          <Text style={styles.mapHintText}>
            This club has no hole map data. Scoring still works without the map.
          </Text>
        ) : null}
        {golfClubError ? <Text style={styles.errorText}>{golfClubError}</Text> : null}

        {/* Sponsor Name */}
        <Text style={styles.formLabel}>Sponsor Name</Text>
        <View style={styles.formInputWrapper}>
          <TextInput
            style={styles.formTextInput}
            placeholder="e.g. TitleTech Golf"
            placeholderTextColor="#A0AEC0"
            value={sponsorName}
            onChangeText={(text) => {
              setSponsorName(text);
              if (sponsorNameError) setSponsorNameError('');
            }}
          />
        </View>
        {sponsorNameError ? <Text style={styles.errorText}>{sponsorNameError}</Text> : null}

        {/* Tournament Prize */}
        <Text style={styles.formLabel}>Tournament Prize</Text>
        <View style={styles.formInputWrapper}>
          <TextInput
            style={styles.formTextInput}
            placeholder="e.g. $5,000 or Club Trophy"
            placeholderTextColor="#A0AEC0"
            value={tournamentPrize}
            onChangeText={(text) => {
              setTournamentPrize(text);
              if (tournamentPrizeError) setTournamentPrizeError('');
            }}
          />
        </View>
        {tournamentPrizeError ? (
          <Text style={styles.errorText}>{tournamentPrizeError}</Text>
        ) : null}

        {/* Start Date */}
        <Text style={styles.formLabel}>Start Date</Text>
        <TouchableOpacity
          style={styles.formDropdownTrigger}
          onPress={handleOpenDatePicker}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownValueText, !startDate && { color: '#A0AEC0' }]}>
            {startDate ? formatDisplayDate(startDate) : 'Select Start Date'}
          </Text>
          <AuthIcon name="calendar" size={moderateScale(16)} color="#093A24" />
        </TouchableOpacity>
        {startDateError ? <Text style={styles.errorText}>{startDateError}</Text> : null}

        {/* Invite Status (Dropdown) - Commented out as requested */}
        {/*
        <Text style={styles.formLabel}>Invite Status</Text>
        <TouchableOpacity
          style={styles.formDropdownTrigger}
          onPress={() =>
            handleOpenDropdown('inviteStatus', ['Open to all', 'Invite only'], setInviteStatus)
          }
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownValueText}>{inviteStatus}</Text>
          <AuthIcon
            name="chevron-left"
            size={moderateScale(14)}
            color="#093A24"
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        </TouchableOpacity>
        */}

        {/* Checkbox Rows */}
        <TouchableOpacity
          style={[styles.checkboxOptionRow, { marginTop: hp(1.5) }]}
          onPress={() => setAllowInvites(!allowInvites)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkboxBox, allowInvites && styles.checkboxBoxChecked]}>
            {allowInvites && <AuthIcon name="check" size={moderateScale(12)} color={COLORS.white} />}
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxTitleText}>Allow invites</Text>
            <Text style={styles.checkboxSubText}>Send invites to players or teams</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxOptionRow}
          onPress={() => setShareLink(!shareLink)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkboxBox, shareLink && styles.checkboxBoxChecked]}>
            {shareLink && <AuthIcon name="check" size={moderateScale(12)} color={COLORS.white} />}
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxTitleText}>Share link</Text>
            <Text style={styles.checkboxSubText}>Generate a join URL (shown after create)</Text>
          </View>
        </TouchableOpacity>

        {/* Number Of Games (Dropdown) */}
        <Text style={styles.formLabel}>Number Of Games</Text>
        <TouchableOpacity
          style={styles.formDropdownTrigger}
          onPress={() => handleOpenDropdown('games', ['1', '2', '3'], setNumberOfGames)}
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownValueText}>{numberOfGames}</Text>
          <AuthIcon
            name="chevron-left"
            size={moderateScale(14)}
            color="#093A24"
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        </TouchableOpacity>
        {submissionError ? <Text style={styles.errorText}>{submissionError}</Text> : null}

        {/* Submit Button */}
        <AuthButton
          title={isEditing ? 'SAVE CHANGES' : 'CREATE TOURNAMENT'}
          onPress={handleCreateTournament}
          loading={submitting}
          style={{ marginTop: hp(3), marginBottom: hp(6) }}
        />
      </ScrollView>

      {/* Global Dropdown Modal */}
      <Modal
        visible={activeDropdown !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <Text style={styles.modalHeaderTitle}>
              {activeDropdown === 'country'
                ? 'Select Country'
                : activeDropdown === 'golfClub'
                  ? 'Select Golf Club'
                  : activeDropdown === 'state'
                    ? 'Select State'
                    : 'Select Option'}
            </Text>

            {['country', 'golfClub', 'state'].includes(activeDropdown) && (
              <View style={styles.modalSearchWrapper}>
                <AuthIcon
                  name="search"
                  size={moderateScale(15)}
                  color="#718096"
                  style={styles.modalSearchIcon}
                />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={`Search ${activeDropdown === 'country'
                      ? 'country'
                      : activeDropdown === 'golfClub'
                        ? 'golf club'
                        : 'state'
                    }...`}
                  placeholderTextColor="#A0AEC0"
                  value={dropdownSearchQuery}
                  onChangeText={setDropdownSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {!!dropdownSearchQuery && (
                  <TouchableOpacity onPress={() => setDropdownSearchQuery('')} activeOpacity={0.7}>
                    <AuthIcon name="x-circle" size={moderateScale(16)} color="#A0AEC0" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <FlatList
              data={dropdownOptions.filter((item) => {
                if (!dropdownSearchQuery.trim()) return true;
                const label = typeof item === 'object' ? (item.label || item.value?.clubName || item.value?.name || '') : String(item);
                return label.toLowerCase().includes(dropdownSearchQuery.toLowerCase());
              })}
              keyExtractor={(item, index) =>
                typeof item === 'object' ? (item.label || '') + index : String(item) + index
              }
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={{ paddingVertical: hp(3), alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONTS.medium, fontSize: fontSize(13), color: '#718096' }}>
                    No matching options found.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const label = typeof item === 'object' ? item.label : item;
                const showMapBadge =
                  activeDropdown === 'golfClub' && typeof item === 'object';
                const hasMap = showMapBadge ? Boolean(item.hasMap) : null;
                return (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      if (dropdownCallback)
                        dropdownCallback(typeof item === 'object' ? item.value : item);
                      setActiveDropdown(null);
                    }}
                  >
                    <Text style={[styles.modalItemText, { flex: 1 }]} numberOfLines={1}>
                      {label}
                    </Text>
                    {showMapBadge ? (
                      <View
                        style={[
                          styles.mapBadge,
                          hasMap ? styles.mapBadgeYes : styles.mapBadgeNo,
                        ]}
                      >
                        <AuthIcon
                          name="map-pin"
                          size={moderateScale(11)}
                          color={hasMap ? '#0E3B2E' : '#718096'}
                        />
                        <Text
                          style={[
                            styles.mapBadgeText,
                            hasMap ? styles.mapBadgeTextYes : styles.mapBadgeTextNo,
                          ]}
                        >
                          {hasMap ? 'Map' : 'No map'}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {/* Date Picker Modal / Dialog */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
            <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { alignItems: 'center', paddingBottom: hp(1.5) }]}>
              <Text style={styles.modalHeaderTitle}>Select Start Date</Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="inline"
                minimumDate={new Date()}
                themeVariant="light"
                accentColor="#093A24"
                style={{ width: wp(80), height: hp(38) }}
                onChange={(event, date) => {
                  if (date) {
                    setSelectedDate(date);
                    const formatted = formatDateString(date);
                    setStartDate(formatted);
                    if (startDateError) setStartDateError('');
                  }
                }}
              />
              <TouchableOpacity
                style={[styles.modalItem, { width: '100%', borderBottomWidth: 0, marginTop: hp(0.5) }]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={[styles.modalItemText, { color: '#093A24', fontFamily: FONTS.bold, fontSize: fontSize(16) }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (event.type === 'set' && date) {
                setSelectedDate(date);
                const formatted = formatDateString(date);
                setStartDate(formatted);
                if (startDateError) setStartDateError('');
              }
            }}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  bannerHeader: {
    backgroundColor: '#093A24',
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4.5),
    paddingBottom: hp(4),
    paddingHorizontal: wp(5),
    position: 'relative',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 58, 36, 0.40)',
  },
  backButtonCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    zIndex: 10,
  },
  bannerTextContainer: {
    zIndex: 5,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(26),
    color: COLORS.white,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    borderTopLeftRadius: moderateScale(22),
    borderTopRightRadius: moderateScale(22),
    marginTop: -hp(2.5),
  },
  formScrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2.5),
    paddingBottom: hp(4),
  },
  formLabel: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13.5),
    color: '#0E3B2E',
    marginBottom: hp(0.8),
    marginTop: hp(1.2),
  },
  formInputWrapper: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(14),
    paddingHorizontal: wp(4),
    height: hp(5.6),
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  formTextInput: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: '#0E3B2E',
    padding: 0,
  },
  multilineWrapper: {
    height: hp(12),
    paddingVertical: hp(1.2),
    justifyContent: 'flex-start',
  },
  multilineInput: {
    height: '100%',
  },
  formDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(14),
    paddingHorizontal: wp(4),
    height: hp(5.6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownValueText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: '#0E3B2E',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfColumn: {
    width: '48%',
  },
  checkboxOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  checkboxBox: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(6),
    borderWidth: 1.8,
    borderColor: '#CBD5E0',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  checkboxBoxChecked: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxTitleText: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(13.5),
    color: '#0E3B2E',
  },
  checkboxSubText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11.5),
    color: '#718096',
    marginTop: hp(0.2),
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11.5),
    color: '#E53E3E',
    marginTop: hp(0.4),
    marginLeft: wp(1),
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    borderRadius: moderateScale(999),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    marginHorizontal: wp(2),
  },
  mapBadgeYes: {
    backgroundColor: 'rgba(188, 255, 0, 0.35)',
  },
  mapBadgeNo: {
    backgroundColor: '#EDF2F7',
  },
  mapBadgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(10),
  },
  mapBadgeTextYes: {
    color: '#0E3B2E',
  },
  mapBadgeTextNo: {
    color: '#718096',
  },
  mapHintText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(11.5),
    color: '#718096',
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  modalContent: {
    width: '100%',
    maxHeight: hp(55),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(22),
    padding: moderateScale(20),
    elevation: 5,
  },
  modalHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(16.5),
    color: '#093A24',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(22),
    height: hp(5.2),
    backgroundColor: '#F8FAF9',
    paddingHorizontal: wp(3.5),
    marginBottom: hp(1.5),
  },
  modalSearchIcon: {
    marginRight: wp(2.5),
  },
  modalSearchInput: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(13.5),
    color: '#0E3B2E',
    flex: 1,
    padding: 0,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.6),
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  modalItemText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(14.5),
    color: '#093A24',
    textAlign: 'center',
  },
});

export default CreateTournamentScreen;
