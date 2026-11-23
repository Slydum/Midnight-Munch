import React from "react";
import { ScrollView, View, Text, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, serif } from "../lib/theme";
export function Page({children}:{children:React.ReactNode}) { return <SafeAreaView style={s.safe} edges={["top"]}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>{children}</ScrollView></SafeAreaView>; }
export function Eyebrow({children}:{children:React.ReactNode}) { return <Text style={s.eyebrow}>{children}</Text>; }
export function Heading({children,sub}:{children:React.ReactNode;sub?:string}) { return <View style={s.headingWrap}><Text style={s.heading}>{children}</Text>{sub?<Text style={s.sub}>{sub}</Text>:null}</View>; }
export function Card({children,style}:{children:React.ReactNode;style?:ViewStyle}) { return <View style={[s.card,style]}>{children}</View>; }
export function SectionTitle({children,right}:{children:React.ReactNode;right?:React.ReactNode}) { return <View style={s.sectionRow}><Text style={s.section}>{children}</Text>{right}</View>; }
export function Small({children}:{children:React.ReactNode}) { return <Text style={s.small}>{children}</Text>; }
export const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.paper},page:{paddingHorizontal:22,paddingTop:18,paddingBottom:42},eyebrow:{fontSize:9,fontWeight:"800",letterSpacing:2.1,color:C.sage,marginBottom:11},headingWrap:{marginBottom:23},heading:{fontFamily:serif,fontSize:36,lineHeight:42,color:C.ink,letterSpacing:-1.2},sub:{fontSize:13,color:C.muted,marginTop:7,lineHeight:20,maxWidth:300},card:{backgroundColor:C.card,borderRadius:21,borderWidth:1,borderColor:C.line,padding:17,marginBottom:13},sectionRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:11,marginBottom:12},section:{fontFamily:serif,fontSize:23,color:C.ink,letterSpacing:-.4},small:{fontSize:11,color:C.muted,lineHeight:17}});