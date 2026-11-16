import styles from "./Spinner.module.css";

function Spinner({ height = " h-screen" }) {
  return (
    <div className={`${height} flex items-center justify-center bg-primary`}>
      <span className={styles.loader}></span>
    </div>
  );
}

export default Spinner;
