import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import InputBase from '@material-ui/core/InputBase';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { createStyles, fade, Theme, makeStyles } from '@material-ui/core/styles';
import MailIcon from '@material-ui/icons/MailOutline';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

const SERVER_URL = 'http://localhost:8081';
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class Comment {
  constructor(name: string, content: string) {
    this.name = name;
    this.content = content;
  }

  id?: number;

  name: string;

  content: string;

  createdAt?: Date;

  updatedAt?: Date;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  grow: {
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
    marginTop: '5ch',
  },
  commentItem: {
    borderBottom: 'solid 1px #eee',
  },
  heightAuto: {
    height: 'auto',
  },
  disabled: {
    display: 'none',
  },
  topMargin: {
    marginTop: '2ch',
  },
  bottomMargin: {
    marginBottom: '2ch',
  },
  name: {
    textAlign: 'right',
    paddingRight: '5ch',
  },
}));

const CommentItem = ({ comment, setAlert, onRefresh }: {
  comment: Comment,
  setAlert: React.Dispatch<React.SetStateAction<string>>,
  onRefresh: Function
}) => {
  const [open, setOpen] = React.useState<string>('closed');
  const [password, setPassword] = React.useState<string>('');

  const classes = useStyles();

  const handleEditOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    setOpen(open === 'edit' ? 'closed' : 'edit');
  };

  const handleDeleteOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    setOpen(open === 'delete' ? 'closed' : 'delete');
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!password) {
      setAlert('비밀번호를 입력해주세요.');
      setTimeout(() => setAlert(''), 3000);
    } else {
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
              setOpen('closed');
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
    }
  };

  return (
    <>
      <ListItem className={classes.commentItem}>
        <ListItemText
          primary={comment.content}
          secondary={comment.createdAt}
        />
        <div className={classes.grow} />
        <ListItemText
          secondary={comment.name}
          className={classes.name}
        />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="edit" onClick={handleEditOpen}>
            <EditIcon />
          </IconButton>
          <IconButton edge="end" aria-label="delete" onClick={handleDeleteOpen}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem className={open === 'delete' ? classes.heightAuto : classes.disabled}>
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
      <div className={open === 'edit' ? classes.heightAuto : classes.disabled}>
        <CommentEditor comment={comment} setAlert={setAlert} onRefresh={onRefresh} />
      </div>
    </>
  );
};

const CommentEditor = ({ comment, setAlert, onRefresh }: {
  comment: Comment,
  setAlert: React.Dispatch<React.SetStateAction<string>>,
  onRefresh: Function
}) => {
  const [name, setName] = React.useState<string>(comment.name);
  const [password, setPassword] = React.useState<string>('');
  const [content, setContent] = React.useState<string>(comment.content);

  const classes = useStyles();

  const handleEdit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!name || !content || !password) {
      setAlert('모든 칸을 채워주세요!');
      setTimeout(() => setAlert(''), 3000);
    } else {
      fetch(`${SERVER_URL}/comment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: comment.id, name, password, content }),
      }).then((response) => response.json())
        .then((json) => {
          switch (json.error) {
            case 0:
              setAlert('성공적으로 업데이트 되었습니다.');
              setTimeout(() => setAlert(''), 3000);
              setName('');
              setPassword('');
              setContent('');
              onRefresh();
              break;
            case 400:
              setAlert('입력을 확인하세요.');
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
    }
  };

  return (
    <ListItem className={classes.topMargin}>
      <form className={classes.grow}>
        <Grid container className={classes.bottomMargin}>
          <Grid item xs={12} sm={4} md>
            <TextField
              label="이름"
              placeholder="홍길동"
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          </Grid>
          <div className={classes.grow} />
          <Grid item xs={12} sm={4} md>
            <TextField
              label="비밀번호"
              placeholder="****"
              type="password"
              variant="standard"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
        <TextField
          label="내용"
          placeholder="아무 얘기나 적어주세요"
          multiline
          fullWidth
          variant="standard"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Grid container className={classes.topMargin}>
          <Grid item xs />
          <Grid item>
            <Button
              variant="contained"
              type="submit"
              onClick={handleEdit}
            >
              수정
            </Button>
          </Grid>
        </Grid>
      </form>
    </ListItem>
  );
};

export default function App() {
  const [name, setName] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [content, setContent] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [res, setRes] = React.useState<string>('');
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoading, setLoading] = React.useState<boolean>(true);
  const classes = useStyles();

  const fetchData = () => {
    setLoading(true);
    fetch(`${SERVER_URL}/comments`, {
      method: 'GET',
    }).then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setRes('Server Error');
        } else {
          setComments(json.comments);
        }
      })
      .catch(() => setRes('인터넷 연결 상태를 확인하세요!'))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setRes('올바른 이메일 주소를 입력하세요!');
      setTimeout(() => setRes(''), 3000);
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

  const handleUpload = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!name || !content || !password) {
      setRes('모든 칸을 채워주세요!');
      setTimeout(() => setRes(''), 3000);
    } else {
      fetch(`${SERVER_URL}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password, content }),
      }).then((response) => response.json())
        .then((json) => {
          switch (json.error) {
            case 0:
              setRes('성공적으로 업로드되었습니다.');
              setTimeout(() => setRes(''), 3000);
              setName('');
              setPassword('');
              setContent('');
              fetchData();
              break;
            case 400:
              setRes('입력을 확인하세요.');
              break;
            default:
              setRes('서버 에러 발생');
              break;
          }
        })
        .catch(() => setRes('네트워크 상태를 확인하세요.'));
    }
  };

  return (
    <>
      <div className={classes.grow}>
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
        <Paper className={classes.commentList}>
          <List dense>
            {isLoading ? (
              <Typography>Loading...</Typography>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  comment={comment}
                  setAlert={setRes}
                  onRefresh={fetchData}
                  key={comment.id}
                />
              ))
            )}
            <ListItem className={classes.topMargin}>
              <form className={classes.grow}>
                <Grid container className={classes.bottomMargin}>
                  <Grid item xs={12} sm={4} md>
                    <TextField
                      label="이름"
                      placeholder="홍길동"
                      variant="standard"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <div className={classes.grow} />
                  <Grid item xs={12} sm={4} md>
                    <TextField
                      label="비밀번호"
                      placeholder="****"
                      type="password"
                      variant="standard"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="내용"
                  placeholder="아무 얘기나 적어주세요"
                  multiline
                  fullWidth
                  variant="standard"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Grid container className={classes.topMargin}>
                  <Grid item xs />
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      onClick={handleUpload}
                    >
                      등록
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </ListItem>
          </List>
        </Paper>
      </Container>
    </>
  );
}
