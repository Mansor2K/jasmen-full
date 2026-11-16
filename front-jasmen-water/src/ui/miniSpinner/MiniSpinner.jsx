import styles from "./MiniSpinner.module.css";

function MiniSpinner() {
  return (
    <div className="flex items-center justify-center rounded-md bg-secondary p-[30px]">
      <div className={styles.loader}></div>
    </div>
  );
}

export default MiniSpinner;
