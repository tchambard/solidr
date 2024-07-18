import * as _ from "lodash";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import SessionAddMemberDialog from "./SessionAddMemberDialog";
import PageTitleWrapper from "@/components/PageTitleWrapper";
import { sessionCurrentState } from "@/store/sessions";
import { useRecoilValue } from "recoil";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import AddressAvatar from "@/components/AddressAvatar";
import ListItemText from "@mui/material/ListItemText";
import { SessionStatus } from "@solidr";

export default () => {
  const [addMemberDialogVisible, setAddMemberDialogVisible] = useState(false);
  const sessionCurrent = useRecoilValue(sessionCurrentState);

  return (
    <>
      <PageTitleWrapper>
        <Grid container justifyContent={"space-between"} alignItems={"center"}>
          <Grid item>
            <Typography variant={"h3"} component={"h3"} gutterBottom>
              List of members
            </Typography>
          </Grid>
          <Grid item>
            {sessionCurrent.isAdmin &&
              sessionCurrent.session?.status === SessionStatus.Opened && (
                <Tooltip placement={"bottom"} title={"Register new member"}>
                  <IconButton
                    color={"primary"}
                    onClick={() =>
                      setAddMemberDialogVisible(!addMemberDialogVisible)
                    }
                  >
                    <AddCircleIcon />
                  </IconButton>
                </Tooltip>
              )}
          </Grid>
        </Grid>
      </PageTitleWrapper>

      <Divider variant={"middle"} />

      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {_.map(sessionCurrent.members, (member, address) => {
          return (
            <ListItem key={`voter_${address}`}>
              <Tooltip title={address}>
                <ListItemAvatar>
                  <AddressAvatar address={address} />
                </ListItemAvatar>
              </Tooltip>
              <ListItemText primary={member.name} />
            </ListItem>
          );
        })}
      </List>
      {addMemberDialogVisible && (
        <SessionAddMemberDialog
          dialogVisible={addMemberDialogVisible}
          setDialogVisible={setAddMemberDialogVisible}
        />
      )}
    </>
  );
};
