import './dragitem.scss';

type Props = {
  id: string;
  children?: React.ReactNode;
};

export const DragItem = ({ id, children }: Props) => {
  return (
    <li id={id} className='dragitem'>
      {children}
    </li>
  );
};
