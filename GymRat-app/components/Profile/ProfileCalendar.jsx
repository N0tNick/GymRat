import React from 'react';
import { Calendar, Text } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';


export const ProfileCalendar = () => {

  const [date, setDate] = React.useState(new Date());

  return (
    <View>
      <Text category='h6'>
        Selected date:
        {' '}
        {date.toLocaleDateString()}
      </Text>

      <Calendar
        date={date}
        onSelect={nextDate => setDate(nextDate)}
      />
    </View>
  );
};