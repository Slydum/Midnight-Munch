import React from "react";
import {Tabs} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {C} from "../../lib/theme";
const icons:any={index:"home",plan:"calendar-clear-outline",cook:"restaurant-outline",market:"basket-outline",recipes:"book-outline"};
const labels:any={index:"Today",plan:"Meal plan",cook:"Cook",market:"Market",recipes:"Recipes"};
export default function TabLayout(){return <Tabs screenOptions={({route})=>({headerShown:false,tabBarActiveTintColor:C.sageDeep,tabBarInactiveTintColor:"#99998D",tabBarStyle:{height:86,paddingTop:10,paddingBottom:25,backgroundColor:C.card,borderTopColor:C.line,borderTopWidth:1,elevation:0,shadowOpacity:0},tabBarLabelStyle:{fontSize:9,fontWeight:"700",letterSpacing:.15},tabBarIcon:({color,size,focused})=><Ionicons name={icons[route.name]||"ellipse-outline"} size={focused?21:size} color={color}/>,tabBarLabel:labels[route.name]||route.name})}><Tabs.Screen name="index"/><Tabs.Screen name="plan"/><Tabs.Screen name="cook"/><Tabs.Screen name="market"/><Tabs.Screen name="recipes"/></Tabs>}
