interface CardPermissionTypeProps {
  currentPermission:number;
  selectPermission:number;
  setPermission: (permission: number) => void;
  children: React.ReactNode;
}


const CardPermissionType = ({currentPermission,selectPermission,children, setPermission}: CardPermissionTypeProps) => {
    return (
        <label className="chat-share-option">
            <input
            type="radio"
            name="share-permission"
            value="read"
            checked={currentPermission === selectPermission}
            onChange={() => setPermission(currentPermission)}
            />
            {children}
        </label>
    )
}

export default CardPermissionType