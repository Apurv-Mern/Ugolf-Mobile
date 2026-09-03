if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "D:/Apurv/Projects/Ugolf-Mobile/node_modules/react-native-reanimated/android/build/intermediates/cxx/RelWithDebInfo/4l5v64y1/obj/x86_64/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "D:/Apurv/Projects/Ugolf-Mobile/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

