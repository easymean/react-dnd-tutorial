import { useId } from 'react';
import './dragitem.scss';

type Props = {
  id?: string;
  children?: React.ReactNode;
};

export const DragItem = ({ id, children }: Props) => {
  const uid = useId();
  const itemId = id ?? uid;
  return (
    <li id={itemId} className='dragitem'>
      {children}
    </li>
  );
};
