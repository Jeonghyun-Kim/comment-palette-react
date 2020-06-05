import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { createStyles, fade, Theme, makeStyles } from '@material-ui/core/styles';
import MailIcon from '@material-ui/icons/MailOutline';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const SERVER_URL = 'http://localhost:8081';
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

interface Comment {
  id: number;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    display: 'block',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  mailIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from mailIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '16ch',
    '&:focus': {
      width: '24ch',
    },
  },
  submit: {
    backgroundColor: 'white',
  },
  commentList: {
    backgroundColor: 'coral',
  },
  deleteSection: {
    height: 'auto',
    transition: theme.transitions.create('height'),
  },
}));

const Item = ({ comment, setAlert, onRefresh }: {
  comment: Comment,
  setAlert: React.Dispatch<React.SetStateAction<string>>,
  onRefresh: Function
}) => {
  const [onDelete, setOnDelete] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>('');

  const classes = useStyles();

  const toggleOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    setOnDelete(!onDelete);
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    fetch(`${SERVER_URL}/comment`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: comment.id, password }),
    }).then((response) => response.json())
      .then((json) => {
        switch (json.error) {
          case 0:
            setAlert('성공적으로 삭제되었습니다.');
            setTimeout(() => setAlert(''), 3000);
            setOnDelete(false);
            onRefresh();
            break;
          case 401:
            setAlert('비밀번호가 다릅니다.');
            break;
          default:
            setAlert('서버 에러 발생');
            break;
        }
      })
      .catch(() => setAlert('네트워크 상태를 확인하세요.'));
  };

  return (
    <>
      <ListItem>
        <ListItemText
          primary={comment.content}
          secondary={comment.createdAt}
        />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="delete" onClick={toggleOpen}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      {onDelete && (
        <ListItem className={classes.deleteSection}>
          <Grid container>
            <Grid item xs>
              <InputBase
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                fullWidth
              />
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handleDelete}>삭제</Button>
            </Grid>
          </Grid>
        </ListItem>
      )}
    </>
  );
};

export default function App() {
  const [email, setEmail] = React.useState<string>('');
  const [res, setRes] = React.useState<string>('');
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');
  const classes = useStyles();

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setRes('올바른 이메일 주소를 입력하세요!');
    } else {
      fetch(`${SERVER_URL}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then((response) => response.json())
        .then((json) => {
          switch (json.error) {
            case 0:
              setRes('성공적으로 등록되었습니다.');
              setEmail('');
              setTimeout(() => setRes(''), 3000);
              break;
            default:
              setRes('데이터베이스 서버에 문제가 있습니다.');
              break;
          }
        })
        .catch(() => setRes('네트워크 연결 상태를 확인하세요.'));
    }
  };

  const fetchData = () => {
    fetch(`${SERVER_URL}/comments`, {
      method: 'GET',
    }).then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setError('Server Error');
        } else {
          setComments(json.comments);
        }
      })
      .catch(() => setError('인터넷 연결 상태를 확인하세요!'))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.title} variant="h6" noWrap>
              Project Palette
            </Typography>
            <div className={classes.search}>
              <div className={classes.mailIcon}>
                <MailIcon />
              </div>
              <form>
                <InputBase
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                  }}
                  inputProps={{ 'aria-label': 'mail' }}
                />
                <Button
                  variant="contained"
                  type="submit"
                  className={classes.submit}
                  onClick={handleSubmit}
                >
                  구독
                </Button>
              </form>
            </div>
          </Toolbar>
        </AppBar>
      </div>
      <Container maxWidth="sm">
        <Typography>
          {res}
        </Typography>
        <div className={classes.commentList}>
          <Typography>{error}</Typography>
          <List dense>
            {isLoading ? (
              <Typography>Loading...</Typography>
            ) : (
              comments.map((comment) => (
                <Item comment={comment} setAlert={setRes} onRefresh={fetchData} key={comment.id} />
              ))
            )}
          </List>
        </div>
      </Container>
    </>
  );
}
