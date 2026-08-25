import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';

import AuthIcon from './AuthIcon';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/fonts';
import { wp, hp, fontSize, moderateScale } from '../../utils/responsive';

/**
 * Reusable Searchable Dropdown Modal for Country, State, City selection
 */
const AuthDropdownPicker = ({
  iconName = 'map-pin',
  placeholder = 'Select option',
  value = '',
  options = [], // [{ label: 'United States', name: 'United States', value: 'US' }, ...]
  onSelect = () => { },
  disabled = false,
  error = false,
  style = {},
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(item => {
    const labelText = item?.label || item?.name || '';
    return labelText.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const handleItemPress = (item) => {
    onSelect(item);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          error ? styles.containerError : styles.containerNormal,
          disabled && styles.containerDisabled,
          style,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.75}
      >
        <AuthIcon
          name={iconName}
          size={moderateScale(18)}
          color={disabled ? '#A0AEC0' : '#888888'}
          style={styles.leftIcon}
        />
        <Text
          style={[
            styles.valueText,
            !value && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <AuthIcon
          name="chevron-down"
          size={moderateScale(18)}
          color={disabled ? '#A0AEC0' : '#888888'}
          style={styles.rightIcon}
        />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>{placeholder}</Text>
            <TouchableOpacity
              style={styles.closeBtnCircle}
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
              }}
              activeOpacity={0.7}
            >
              <AuthIcon name="x" size={moderateScale(18)} color="#093A24" />
            </TouchableOpacity>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBarWrap}>
            <AuthIcon name="search" size={moderateScale(16)} color="#718096" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#A0AEC0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          {/* Options List */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item, index) => item.value || item.name || index.toString()}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = value === item.name || value === item.label;
              return (
                <TouchableOpacity
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {item.label || item.name}
                  </Text>
                  {isSelected && (
                    <AuthIcon name="check" size={moderateScale(16)} color="#1B4D22" />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(10),
    paddingHorizontal: wp(4),
    height: hp(6.2),
    marginBottom: hp(1.8),
    borderWidth: 1.5,
    backgroundColor: COLORS.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  containerNormal: {
    borderColor: '#E2E8F0',
  },
  containerError: {
    borderColor: '#E53E3E',
  },
  containerDisabled: {
    backgroundColor: '#F7FAFC',
    borderColor: '#EDF2F7',
    elevation: 0,
    shadowOpacity: 0,
  },
  leftIcon: {
    marginRight: wp(3),
  },
  rightIcon: {
    marginLeft: wp(2),
  },
  valueText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: COLORS.textDarkTitle,
  },
  placeholderText: {
    color: '#999999',
  },
  disabledText: {
    color: '#A0AEC0',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + hp(1.5) : hp(1.5),
    paddingBottom: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  modalHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
    color: '#093A24',
  },
  closeBtnCircle: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: '#EDF5EF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search Bar
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderRadius: moderateScale(10),
    marginHorizontal: wp(5),
    marginVertical: hp(1.5),
    paddingHorizontal: wp(3.5),
    height: hp(5.2),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: wp(2.5),
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: '#093A24',
    paddingVertical: 0,
  },

  // List Items
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  optionRowSelected: {
    backgroundColor: '#F4FBF6',
    borderRadius: moderateScale(8),
  },
  optionLabel: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(14.5),
    color: '#2D3748',
    flex: 1,
  },
  optionLabelSelected: {
    fontFamily: FONTS.bold,
    color: '#1B4D22',
  },
  emptyWrap: {
    paddingVertical: hp(5),
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(14),
    color: '#A0AEC0',
  },
});

export default AuthDropdownPicker;
