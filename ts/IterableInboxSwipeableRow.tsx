'use strict'

import React, { useRef } from 'react'
import {
   View,
   Text,
   Animated,
   PanResponder,
   StyleSheet,
   Platform
} from 'react-native'

import {
   InboxRowViewModel,
   IterableInboxClickableRow,
   IterableInboxCustomizations,
   IterableInboxDataModel
} from '.'

type SwipeableRowProps = {
   key: string,
   index: number,
   last: boolean,
   dataModel: IterableInboxDataModel,
   rowViewModel: InboxRowViewModel,
   customizations: IterableInboxCustomizations,
   swipingCheck: Function,
   messageListItemLayout: Function,
   deleteRow: Function,
   handleMessageSelect: Function,
   contentWidth: number,
   isPortrait: boolean
}

const IterableInboxSwipeableRow = ({
   index,
   last,
   dataModel,
   rowViewModel,
   customizations,
   swipingCheck,
   messageListItemLayout,
   deleteRow,
   handleMessageSelect,
   contentWidth,
   isPortrait
}: SwipeableRowProps) => {
   const position = useRef(new Animated.ValueXY()).current

   let { textContainer, deleteSlider, textStyle } = styles

   deleteSlider = (isPortrait) ? deleteSlider : {...deleteSlider, paddingRight: 40 }

   const scrollThreshold = contentWidth / 15
   const FORCING_DURATION = 350

   //If user swipes, either complete swipe or reset 
   const userSwipedLeft = (gesture : any) => {
      if(gesture.dx < -0.6 * contentWidth) {
         completeSwipe()  
      } else {
         resetPosition()
         swipingCheck(false)
      }
   }

   const completeSwipe = () => {
      const x = -2000
      Animated.timing(position, {
         toValue: {x, y: 0},
         duration: FORCING_DURATION,
         useNativeDriver: false   
      }).start(() => deleteRow(rowViewModel.inAppMessage.messageId))
   }
   
   const resetPosition = () => {
      Animated.timing(position, {
         toValue: { x: 0, y: 0 },
         duration: 200,
         useNativeDriver: false
      }).start()
   }
   
   const panResponder = useRef(
      PanResponder.create({
         onStartShouldSetPanResponder: () => false,
         onMoveShouldSetPanResponder: () => true,
         onPanResponderTerminationRequest: () => false,
         onPanResponderGrant: () => {
            position.setOffset({ 
               x: position.x._value, 
               y: 0 
            })
            position.setValue({ x: 0.01, y: 0.01 })
         },
         onPanResponderMove: (event, gesture) => {
            if(gesture.dx <= -scrollThreshold) {
               //enables swipeing when threshold is reached
               swipingCheck(true)

               //threshold value is deleted from movement
               const x = gesture.dx + scrollThreshold
               //position is set to the new value
               position.setValue({x, y: 0})
            }
         },
         onPanResponderRelease: (event, gesture) => {
            position.flattenOffset()
            if(gesture.dx < 0) {
               userSwipedLeft(gesture) 
            }
         }
      })
   ).current

   return(
      <View>
         <View style={deleteSlider}>
            <Text style={textStyle}>DELETE</Text>   
         </View>
         <Animated.View 
            style={[textContainer, position.getLayout()]}
            {...panResponder.panHandlers}
         >
            <IterableInboxClickableRow
               index={index}
               last={last}
               dataModel = {dataModel}
               rowViewModel={rowViewModel}
               customizations={customizations}
               messageListItemLayout={messageListItemLayout}
               handleMessageSelect={(messageId: string, index: number) => handleMessageSelect(messageId, index)}
               isPortrait={isPortrait}
            />   
         </Animated.View>
      </View>   
   )
}

const styles = StyleSheet.create({
   textContainer: {
      width: '100%',
      elevation: 2
   },

   deleteSlider: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 10,
      backgroundColor: 'red',
      position: 'absolute',
      elevation: 1,
      width: '100%',
      height: 120
   },

   textStyle: {
      fontWeight: 'bold',
      fontSize: 15,
      color: 'white'
   }
})

export default IterableInboxSwipeableRow