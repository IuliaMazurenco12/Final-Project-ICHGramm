import DimLayer from './DimLayer';
import styles from '../styles/ActionSheet.module.css';

const ActionSheet = ({ actions, onClose }) => (
  <DimLayer onClose={onClose}>
    <div className={styles.sheet} role="menu">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          role="menuitem"
          className={action.danger ? `${styles.option} ${styles.danger}` : styles.option}
          onClick={action.onSelect}
        >
          {action.label}
        </button>
      ))}

      <button type="button" role="menuitem" className={styles.option} onClick={onClose}>
        Cancel
      </button>
    </div>
  </DimLayer>
);

export default ActionSheet;