/*
Purpose
  Shows table when the user does analyze project site and choses to show the table

Child Components
  - None

Libs
  - Not sure yet

API
  - Not sure yet

State needed
  - table or graph
  - Not sure yet

Props
  - GEOJSON data (to get properies aka attributes)
  - Not sure yet
*/
import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles, styled } from '@mui/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const useStyles = makeStyles((theme) => ({
  contentBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.CRESTBlack.dark,
    borderColor: theme.palette.CRESTBorderColor.main,
    borderStyle: 'solid',
    borderWidth: '1px'
  },
  tableHead: {
    backgroundColor: theme.palette.CRESTBlack.dark,
    borderBottomColor: theme.palette.CRESTLight.main,
    borderBottomStyle: 'solid',
    borderBottomWidth: '2px',
    paddingBottom: theme.spacing(2)
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.CRESTDarkAlt.main
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.CRESTGridBackground.dark
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0
  }
}));

export default function TableData(props) {
  const classes = useStyles();
  const { data } = props;

  return (
    <Grid container spacing={0} justifyContent="center" alignItems="center" px={0} pb={4} className={classes.contentBox}>
      <Grid item xs={12} >
        <TableContainer component={Paper}>
          <Table sx={{ width: '100%' }} aria-label="customized table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left">Area&nbsp;Name</TableCell>
                <TableCell align="left">Index</TableCell>
                <TableCell align="left">Value</TableCell>
                <TableCell align="left">Range</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <React.Fragment key={row.areaName}>
                  <StyledTableRow key={`${row.areaName}-${row.name}`}>
                    <TableCell align="left">{row.areaName}</TableCell>
                    <TableCell align="left">{row.name}</TableCell>
                    <TableCell align="left">{row.value}</TableCell>
                    <TableCell align="left">{row.range}</TableCell>
                  </StyledTableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}

TableData.propTypes = {
  data: PropTypes.array.isRequired
};
