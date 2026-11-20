import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../../lib/theme";
const icons:any={index:"home-outline",plan:"calendar-outline",cook:"flame-outline",market:"basket-outline",recipes:"book-outline"};
const labels:any={index:"Today",plan:"Plan",cook:"Cook",market:"Market",recipes:"Recipes"};
export default function TabLayout(){return <Tabs screenOptions={({route})=>({headerShown:false,tabBarActiveTintColor:C.sage,tabBarInactiveTintColor:C.muted,tabBarStyle:{height:84,paddingTop:10,paddingBottom:24,backgroundColor:C.card,borderTopColor:C.line,elevation:0},tabBarLabelStyle:{fontSize:10,fontWeight:"600"},tabBarIcon:({color,size})=><Ionicons name={icons[route.name]||"ellipse-outline"} size={size} color={color}/>,tabBarLabel:labels[route.name]||route.name})}>
<Tabs.Screen name="index"/><Tabs.Screen name="plan"/><Tabs.Screen name="cook"/><Tabs.Screen name="market"/><Tabs.Screen name="recipes"/>
</Tabs>}
