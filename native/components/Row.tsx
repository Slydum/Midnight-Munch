import React from "react";import {View,Text,StyleSheet,ViewStyle} from "react-native";import {C} from "../lib/theme";
export function Row({left,right,style}:{left:React.ReactNode;right?:React.ReactNode;style?:ViewStyle}){return <View style={[s.row,style]}><View style={{flex:1}}>{left}</View>{right}</View>}
export function Label({children}:{children:React.ReactNode}){return <Text style={s.label}>{children}</Text>}
const s=StyleSheet.create({row:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10},label:{fontSize:14,fontWeight:"700",color:C.ink}});
