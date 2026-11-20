import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";
import { C } from "../lib/theme";
export default function NotFound(){return <View style={{flex:1,backgroundColor:C.paper,alignItems:"center",justifyContent:"center",padding:30}}><Text style={{fontFamily:"Georgia",fontSize:28,color:C.ink,marginBottom:12}}>This page wandered off.</Text><Link href="/" style={{color:C.sage,fontWeight:"700"}}>Back to the kitchen</Link></View>}
