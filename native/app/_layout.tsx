import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DataProvider } from "../context/DataProvider";
import { C } from "../lib/theme";
export default function RootLayout(){return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><DataProvider><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:C.paper},animation:"fade"}}><Stack.Screen name="(tabs)"/><Stack.Screen name="fridge" options={{presentation:"modal"}}/><Stack.Screen name="history" options={{presentation:"modal"}}/></Stack></DataProvider></SafeAreaProvider></GestureHandlerRootView>}
