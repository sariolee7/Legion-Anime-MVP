import { useEffect, useId } from 'react';
import { Platform, Text, type StyleProp, type TextStyle } from 'react-native';

interface TruncatedTitleProps {
  text: string;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Título con máximo de líneas y elipsis. En web añade el atributo nativo
 * `title` (tooltip con el nombre completo) sobre el nodo renderizado.
 */
export function TruncatedTitle({ text, numberOfLines = 2, style }: TruncatedTitleProps) {
  const id = useId();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    document.getElementById(id)?.setAttribute('title', text);
  }, [id, text]);

  return (
    <Text nativeID={id} numberOfLines={numberOfLines} ellipsizeMode="tail" style={style}>
      {text}
    </Text>
  );
}
