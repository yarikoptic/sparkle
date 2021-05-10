import React, { useCallback, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faLockOpen,
  faChevronLeft,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

import firebase from "firebase/app";

import { User } from "types/User";
import { Table } from "types/Table";

import { useRecentVenueUsers } from "hooks/users";
import { useUser } from "hooks/useUser";
import { useSelector } from "hooks/useSelector";

import { experienceSelector } from "utils/selectors";

import "./TableHeader.scss";

interface TableHeaderProps {
  seatedAtTable: string;
  setSeatedAtTable: (val: string) => void;
  venueName: string;
  tables: Table[];
}

const TableHeader: React.FC<TableHeaderProps> = ({
  seatedAtTable,
  setSeatedAtTable,
  venueName,
  tables,
}) => {
  const { user, profile } = useUser();

  const experience = useSelector(experienceSelector);
  const { recentVenueUsers } = useRecentVenueUsers();

  const allTables = experience?.tables;

  const tableOfUser = seatedAtTable
    ? tables.find((table) => table.reference === seatedAtTable)
    : undefined;

  const usersAtCurrentTable = useMemo(
    () =>
      seatedAtTable &&
      recentVenueUsers.filter(
        (user: User) => user.data?.[venueName]?.table === seatedAtTable
      ),
    [seatedAtTable, recentVenueUsers, venueName]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firestoreUpdate = async (doc: string, update: any) => {
    const firestore = firebase.firestore();
    await firestore
      .doc(doc)
      .update(update)
      .catch(() => {
        firestore.doc(doc).set(update);
      });
  };

  const isCurrentTableLocked = useMemo(() => {
    // @debt Why does `locked` has Table type?
    return !!allTables?.[seatedAtTable]?.locked;
  }, [allTables, seatedAtTable]);

  const currentTableHasSeatedUsers = useMemo(
    () =>
      recentVenueUsers.filter(
        (user: User) => user.data?.[venueName]?.table === seatedAtTable
      ).length !== 0,
    [venueName, recentVenueUsers, seatedAtTable]
  );

  const tableTitle = tableOfUser?.title ?? "Table";
  const tableCapacity = tableOfUser?.capacity;
  const numberOfSeatsLeft = useMemo(() => {
    if (!tableCapacity || !usersAtCurrentTable) return 0;

    return tableCapacity - usersAtCurrentTable.length;
  }, [tableCapacity, usersAtCurrentTable]);

  const setIsCurrentTableLocked = useCallback(
    (locked: boolean) => {
      const doc = `experiences/${venueName}`;
      const update = {
        tables: { ...allTables, [seatedAtTable]: { locked } },
      };
      firestoreUpdate(doc, update);
    },
    [venueName, allTables, seatedAtTable]
  );

  const toggleIsCurrentTableLocked = useCallback(
    () => setIsCurrentTableLocked(!isCurrentTableLocked),
    [setIsCurrentTableLocked, isCurrentTableLocked]
  );

  useEffect(() => {
    if (isCurrentTableLocked && !currentTableHasSeatedUsers) {
      setIsCurrentTableLocked(false);
    }
  }, [
    recentVenueUsers,
    seatedAtTable,
    isCurrentTableLocked,
    currentTableHasSeatedUsers,
    setIsCurrentTableLocked,
  ]);

  const leaveSeat = useCallback(async () => {
    if (!user || !profile) return;

    const doc = `users/${user.uid}`;
    const existingData = profile.data;
    const update = {
      data: {
        ...existingData,
        [venueName]: {
          table: null,
          videoRoom: null,
        },
      },
    };
    await firestoreUpdate(doc, update);

    setSeatedAtTable("");
  }, [user, profile, venueName, setSeatedAtTable]);

  useEffect(() => {
    window.addEventListener("beforeunload", leaveSeat);
    return () => {
      window.removeEventListener("beforeunload", leaveSeat, false);
    };
  }, [leaveSeat]);

  return (
    <div className="row table-header">
      <div className="table-header__leave-table">
        <button
          type="button"
          title={"Leave " + seatedAtTable}
          className="table-header__leave-button"
          id="leave-seat"
          onClick={leaveSeat}
        >
          <FontAwesomeIcon
            className="table-header__leave-button--icon"
            icon={faChevronLeft}
            size="xs"
          />
          Leave table
        </button>
      </div>

      <div className="table-header__topic-info">
        <div className="row table-header__topic">
          <div>{tableTitle}</div>

          <div className="table-header__edit-topic-button">
            <FontAwesomeIcon icon={faPen} />
          </div>
        </div>

        {tableCapacity && (
          <span className="table-header__seats-left">
            {numberOfSeatsLeft} seats left
          </span>
        )}

        {tableOfUser && tableOfUser.subtitle && (
          <label>{tableOfUser.subtitle}</label>
        )}
      </div>

      <div className="table-header__lock-button">
        <FontAwesomeIcon
          className="table-header__lock-button--icon"
          icon={isCurrentTableLocked ? faLock : faLockOpen}
          size="sm"
        />
        <div className="table-header__lock-indication">
          {isCurrentTableLocked ? "Table Locked" : "Lock Table"}
        </div>
        <label className="switch table-header__lock-toggle">
          <input
            type="checkbox"
            className="switch-hidden-input"
            checked={!!isCurrentTableLocked}
            onChange={toggleIsCurrentTableLocked}
          />
          <span className="slider" />
        </label>
      </div>
    </div>
  );
};

export default TableHeader;
