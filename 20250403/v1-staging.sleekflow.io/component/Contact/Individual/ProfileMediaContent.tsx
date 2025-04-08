import React from "react";
import { Table, Visibility } from "semantic-ui-react";
import MediaTableHeader from "./MediaTable/MediaTableHeader";
import MediaTableBody from "./MediaTable/MediaTableBody";
import GridDummy from "../../shared/Placeholder/GridDummy";
import { GridSelection } from "../../shared/grid/GridSelection";
import { ProfileMediaFileType } from "../../../types/IndividualProfileType";
import { useTranslation } from "react-i18next";
import { GET_ATTACHMENT_LINK } from "../../../api/apiPath";
import { downloadAttachmentViaGet } from "../../../api/apiRequest";
import styles from "./ProfileMediaContent.module.css";
import { baseName } from "../../../utility/baseName";

interface ProfileMediaContentProps {
  files: ProfileMediaFileType[];
  isLoading: boolean;
  getMediaFiles: (pageNumber: number) => Promise<void>;
  currPaging: number;
  selectedFiles: ProfileMediaFileType[];
  setSelectedFiles: React.Dispatch<
    React.SetStateAction<ProfileMediaFileType[]>
  >;
}

const ProfileMediaContent = (props: ProfileMediaContentProps) => {
  const {
    isLoading,
    files,
    getMediaFiles,
    currPaging,
    selectedFiles,
    setSelectedFiles,
  } = props;
  const { t } = useTranslation();
  const forwardsEnabled: boolean = false;
  const downloadEnabled: boolean = true;

  function selectAll(): void {
    const allFiles = files.map((file) => ({ ...file }));
    if (files.length === selectedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(allFiles);
    }
  }

  function handleDownloadAll() {
    try {
      selectedFiles.forEach((file, index) => {
        setTimeout(
          (fileData: ProfileMediaFileType) => {
            downloadAttachmentViaGet(
              GET_ATTACHMENT_LINK.replace(
                "{attachmentType}",
                "message"
              ).replace("{fileId}", fileData.fileId),
              baseName(fileData.filename),
              true
            );
          },
          200 + 200 * index,
          file
        );
      });
    } catch (e) {
      console.error(`handleDownloadAll ${e}`);
    }
  }

  const columns = [
    t("profile.individual.media.grid.header.col.name"),
    t("profile.individual.media.grid.header.col.sender"),
    t("profile.individual.media.grid.header.col.size"),
    t("profile.individual.media.grid.header.col.date"),
  ];
  const extraColumns = [
    ...(downloadEnabled ? ["download"] : ""),
    ...(forwardsEnabled ? ["forward"] : ""),
  ];

  return (
    <div className={`hide-scrollable-table ${styles.container}`}>
      <div className="stick-wrap">
        <Table basic={"very"} className={styles.table}>
          {files.length === 0 && isLoading ? (
            <GridDummy
              loading={true}
              columnsNumber={columns.length + extraColumns.length}
              hasCheckbox
              rowSteps={4}
              renderHeader={() => (
                <MediaTableHeader
                  {...{
                    selectAll,
                    isLoading,
                    filesLen: files.length,
                    selectedFilesLen: selectedFiles.length,
                    columns,
                    extraColumns,
                  }}
                />
              )}
            />
          ) : (
            <>
              <MediaTableHeader
                {...{
                  selectAll,
                  isLoading,
                  filesLen: files.length,
                  selectedFilesLen: selectedFiles.length,
                  columns,
                  extraColumns,
                }}
              />
              <GridSelection
                {...{
                  selectedItemsCount: selectedFiles.length,
                  itemsSingular: t(
                    "profile.individual.media.grid.header.item.single"
                  ),
                  itemsPlural: t(
                    "profile.individual.media.grid.header.item.plural"
                  ),
                  deleteConfirmationRequested: false,
                  hasDownloadIcon: downloadEnabled,
                  hasForwardIcon: forwardsEnabled,
                  handleDownloadAll,
                }}
              />
              <Visibility
                as="tbody"
                continuous={false}
                once={false}
                onBottomVisible={() => getMediaFiles(currPaging)}
              >
                <MediaTableBody
                  {...{
                    files,
                    selectedFiles,
                    setSelectedFiles,
                    forwardsEnabled,
                  }}
                />
              </Visibility>
            </>
          )}
        </Table>
      </div>
    </div>
  );
};
export default ProfileMediaContent;
