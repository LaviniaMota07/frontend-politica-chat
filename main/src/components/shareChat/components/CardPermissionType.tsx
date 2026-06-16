import { modalStyles } from '../../../utils/tailwindStyles';

interface CardPermissionTypeProps {
  currentPermission: number;
  selectPermission: number;
  setPermission: (permission: number) => void;
  children: React.ReactNode;
}

const CardPermissionType = ({
  currentPermission,
  selectPermission,
  children,
  setPermission,
}: CardPermissionTypeProps) => {
  return (
    <label className={modalStyles.option}>
      <input
        type="radio"
        name="share-permission"
        value="read"
        checked={currentPermission === selectPermission}
        onChange={() => setPermission(currentPermission)}
      />
      <span className={modalStyles.optionText}>{children}</span>
    </label>
  );
};

export default CardPermissionType;
