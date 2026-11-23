import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../styles/DimLayer.module.css';

const openLayers = [];

const DimLayer = ({ onClose, children }) => {
  const layerIdRef = useRef(Symbol('dim-layer'));
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const layerId = layerIdRef.current;
    openLayers.push(layerId);

    const handleKeyDown = (event) => {
      const isTopLayer = openLayers[openLayers.length - 1] === layerId;
      if (event.key === 'Escape' && isTopLayer) onCloseRef.current();
    };

    const previousOverflow = document.body.style.overflow;

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      openLayers.splice(openLayers.indexOf(layerId), 1);
    };
  }, []);

  const handleLayerMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className={styles.layer} onMouseDown={handleLayerMouseDown}>
      {children}
    </div>,
    document.body
  );
};

export default DimLayer;