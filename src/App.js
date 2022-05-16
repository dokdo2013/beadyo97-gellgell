import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box,
  Badge,
  Image,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Input,
  Link,
  Heading,
  Text,
  Flex,
  Button,
  useToast,
  FormControl,
  FormHelperText,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { FiRefreshCw } from "react-icons/fi";
import axios from "axios";
import { useRef, useState, useEffect } from "react";

function App() {
  const {
    isOpen: rankIsOpen,
    onOpen: rankOnOpen,
    onClose: rankOnClose,
  } = useDisclosure();
  const {
    isOpen: nameIsOpen,
    onOpen: nameOnOpen,
    onClose: nameOnClose,
  } = useDisclosure();
  const {
    isOpen: settingIsOpen,
    onOpen: settingOnOpen,
    onClose: settingOnClose,
  } = useDisclosure();
  const {
    isOpen: noticeIsOpen,
    onOpen: noticeOnOpen,
    onClose: noticeOnClose,
  } = useDisclosure();
  const {
    isOpen: deleteIsOpen,
    onOpen: deleteOnOpen,
    onClose: deleteOnClose,
  } = useDisclosure();
  const btnRef1 = useRef();
  const btnRef2 = useRef();
  const btnRef3 = useRef();
  const toast = useToast();
  let cnt = 1;

  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [ranking, setRanking] = useState([]);
  const [myRanking, setMyRanking] = useState(0);
  const [isSpecial, setIsSpecial] = useState(false);
  const [isLive, setIsLive] = useState(true);

  const baseUrl = "https://api-v1.leaven.team";
  // const baseUrl = "http://0.0.0.0:9091";

  useEffect(() => {
    onLoad();

    // 타이머 설정
    setInterval(() => {
      save();
      isLive && getRanking();
    }, 1000);

    setInterval(() => {
      axios
        .get(baseUrl + "/gell/" + localStorage.getItem("idx"))
        .then((Response) => {
          if (Response.data.code === "SUCCESS") {
            setMyRanking(Response.data.data.rank);
          }
        });
    }, 10000);
  }, []);

  const onLoad = () => {
    localStorage.getItem("count") !== null &&
      setCount(parseInt(localStorage.getItem("count")));
    localStorage.getItem("name") !== null &&
      setName(localStorage.getItem("name"));
    localStorage.getItem("password") !== null &&
      setPassword(localStorage.getItem("password"));
    localStorage.getItem("lastCount") !== null &&
      setPassword(localStorage.getItem("lastCount"));

    // 토큰 발급
    if (
      localStorage.getItem("name") !== "" &&
      localStorage.getItem("password") !== ""
    ) {
      tokenSave();
    }

    // 서버에서 name, count 검증
    if (localStorage.getItem("name") !== "") {
      axios
        .get(baseUrl + "/gell/" + localStorage.getItem("idx"))
        .then((Response) => {
          if (Response.data.code === "SUCCESS") {
            const apiCount = Response.data.data.count;
            setCount(apiCount);
            setMyRanking(Response.data.data.rank);
            localStorage.setItem("count", apiCount);
          } else {
            setName("");
            setPassword("");
            setToken("");
          }
        })
        .catch((Response) => {
          setName("");
          setPassword("");
          setToken("");
        });
    }

    // 랭킹 가져오기
    getRanking();

    setIsLoading(false);
  };

  const addClick = () => {
    localStorage.setItem("count", count + 1);
    setCount(count + 1);
    Math.floor(Math.random() * 20) === 10
      ? setIsSpecial(true)
      : setIsSpecial(false);
  };

  const getRanking = () => {
    axios
      .get(baseUrl + "/gell/ranking")
      .then((Response) => {
        if (Response.data.code === "SUCCESS") {
          setRanking(Response.data.data);
        }
      })
      .catch((Response) => {
        console.log(Response);
      });
  };

  const logoutSave = () => {
    localStorage.setItem("name", "");
    localStorage.setItem("password", "");
    localStorage.setItem("token", "");
    localStorage.setItem("count", 0);

    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const loginSave = () => {
    const formName = document.getElementById("loginName").value.trim();
    const formPassword = document.getElementById("loginPassword").value.trim();

    if (formName === "" || formPassword === "") {
      toast({
        title: "오류",
        description: "이름이나 비밀번호를 입력해주세요",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
      return false;
    } else {
      axios
        .post(baseUrl + "/gell/login", {
          name: formName,
          password: formPassword,
          count: -1,
        })
        .then((Response) => {
          if (Response.data.code === "SUCCESS") {
            setName(formName);
            setPassword(formPassword);
            localStorage.setItem("name", formName);
            localStorage.setItem("password", formPassword);
            tokenSave();
            toast({
              title: "성공",
              description: "로그인 완료!",
              status: "success",
              duration: 10000,
              isClosable: true,
            });
            settingOnClose();
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        })
        .catch(() => {
          toast({
            title: "로그인 실패",
            description: "아이디/비밀번호를 확인해주세요.",
            status: "error",
            duration: 10000,
            isClosable: true,
          });
        });
    }
  };

  const mergeSave = () => {
    const formName = document.getElementById("mergeName").value.trim();
    const formPassword = document.getElementById("mergePassword").value.trim();
    const targetName = localStorage.getItem("name");

    if (formName === "" || formPassword === "") {
      toast({
        title: "오류",
        description: "이름이나 비밀번호를 입력해주세요",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
      return false;
    } else {
      axios
        .post(baseUrl + "/gell/merge", {
          name: formName,
          password: formPassword,
          target_name: targetName,
        })
        .then((Response) => {
          if (Response.data.code === "SUCCESS") {
            toast({
              title: "성공",
              description: "계정 합치기에 성공했습니다.",
              status: "success",
              duration: 10000,
              isClosable: true,
            });
            settingOnClose();
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        })
        .catch(() => {
          toast({
            title: "계정확인 실패",
            description:
              "합칠 계정을 확인할 수 없어요. 아이디 또는 비밀번호를 확인해주세요.",
            status: "error",
            duration: 10000,
            isClosable: true,
          });
        });
    }
  };

  const nameSave = () => {
    const formName = document.getElementById("name").value.trim();
    const formPassword = document.getElementById("password").value.trim();

    if (formName === "") {
      toast({
        title: "오류",
        description: "이름을 입력해주세요. (최대 20자)",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
      return false;
    } else if (formName.length > 20) {
      toast({
        title: "오류",
        description:
          "이름을 20자 아래로 입력해주세요. (현재 : " + formName.length + "자)",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
      return false;
    } else if (formPassword === "") {
      toast({
        title: "오류",
        description: "비밀번호를 입력해주세요. (8~20자)",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
      return false;
    } else if (formPassword.length > 20 || formPassword.length < 8) {
      toast({
        title: "오류",
        description:
          "비밀번호를 8~20자 사이로 입력해주세요. (현재 : " +
          formPassword.length +
          "자)",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
      return false;
    } else {
      axios
        .post(baseUrl + "/gell/name", {
          name: formName,
          password: formPassword,
          count: count,
        })
        .then((Response) => {
          if (Response.data.code === "SUCCESS") {
            setName(formName);
            setPassword(formPassword);
            localStorage.setItem("name", formName);
            localStorage.setItem("password", formPassword);
            tokenSave();
            toast({
              title: "성공",
              description: "이름을 설정했습니다!",
              status: "success",
              duration: 10000,
              isClosable: true,
            });
            nameOnClose();
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else if (Response.data.code === "ALREADY_EXIST") {
            toast({
              title: "오류",
              description:
                "이미 동일한 이름이 등록되어있습니다. 다른 이름을 입력해주세요.",
              status: "error",
              duration: 10000,
              isClosable: true,
            });
            return false;
          }
        })
        .catch(() => {
          toast({
            title: "오류",
            description:
              "이미 동일한 이름이 등록되어있습니다. 다른 이름을 입력해주세요.",
            status: "error",
            duration: 10000,
            isClosable: true,
          });
        });
    }
  };

  const deleteSave = () => {
    axios
      .delete(baseUrl + "/gell", {
        data: {
          name: localStorage.getItem("name"),
          password: localStorage.getItem("password"),
        },
      })
      .then((Response) => {
        logoutSave();
      });
  };

  const tokenSave = () => {
    axios
      .post(baseUrl + "/gell/token", {
        name: localStorage.getItem("name"),
        password: localStorage.getItem("password"),
      })
      .then((Response) => {
        if (Response.data.code === "SUCCESS") {
          localStorage.setItem("token", Response.data.data.csrf_token);
          localStorage.setItem("idx", Response.data.data.idx);
        } else if (Response.data.code === "UNAUTHORIZED") {
          toast({
            title: "오류",
            description: Response.data.message,
            status: "error",
            duration: 10000,
            isClosable: true,
          });
          return false;
        }
      })
      .catch((Response) => {
        toast({
          title: "오류",
          description: Response.data.message,
          status: "error",
          duration: 10000,
          isClosable: true,
        });
        return false;
      });
  };

  const save = () => {
    // name과 count 저장
    const saveName = localStorage.getItem("name");
    const saveCount = localStorage.getItem("count");
    const saveLastCount = localStorage.getItem("lastCount");
    const saveToken = localStorage.getItem("token");

    if (saveCount === saveLastCount) {
      return false;
    } else {
      localStorage.setItem("lastCount", saveCount);
    }

    axios
      .post(baseUrl + "/gell", {
        name: saveName,
        count: saveCount,
        csrf_token: saveToken,
      })
      .then((Response) => {
        getRanking();
      });
  };

  return (
    <>
      <Box h={100} pt={5}>
        <Flex justifyContent="center" flexWrap="wrap">
          <Button
            ref={btnRef1}
            colorScheme="teal"
            variant="outline"
            onClick={rankOnOpen}
            mr={2}
            isLoading={isLoading}
          >
            🏆 랭킹
          </Button>
          {name === "" ? (
            <Button
              ref={btnRef2}
              colorScheme="teal"
              variant="outline"
              onClick={nameOnOpen}
              mr={2}
              isLoading={isLoading}
            >
              🎤 로그인/회원가입
            </Button>
          ) : (
            <Button
              ref={btnRef2}
              colorScheme="teal"
              variant="outline"
              onClick={settingOnOpen}
              mr={2}
              isLoading={isLoading}
            >
              🎤 계정 설정하기
            </Button>
          )}
          <Button
            ref={btnRef3}
            colorScheme="teal"
            variant="outline"
            onClick={noticeOnOpen}
            isLoading={isLoading}
          >
            🚦 유의사항
          </Button>
        </Flex>
      </Box>
      <Flex
        style={{ height: "calc(100vh - 100px)" }}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <>
          {count !== 0 && count % 100 === 0 ? (
            <Image
              display={isLoading && "none"}
              className="gell img2"
              src="oh.png"
              mb="10%"
              onClick={addClick}
            ></Image>
          ) : isSpecial ? (
            <Image
              display={isLoading && "none"}
              className="gell img1"
              src="dk2.png"
              w={320}
              h={320}
              mb="10%"
              onClick={addClick}
            ></Image>
          ) : (
            <Image
              display={isLoading && "none"}
              className="gell img1"
              src="gellgell.png"
              mb="10%"
              onClick={addClick}
            ></Image>
          )}
          <Heading>
            {isLoading ? "로딩 중입니다..." : count.toLocaleString()}
          </Heading>
          <Text display={isLoading ? "block" : "none"} mt={5} mb="10%">
            로딩 중 화면이 계속해서 뜨면 개발자에게 문의해주세요. (
            <Link href="mailto:hyeonwoo5342@gmail.com">메일 보내기</Link>)
          </Text>
          <Text display={isLoading ? "none" : "block"} mt={5} mb="10%">
            {name === ""
              ? "로그인/회원가입 버튼을 눌러 계정을 설정해주세요."
              : name + "님은 현재 " + myRanking + "등입니다"}
          </Text>
        </>
      </Flex>

      <Drawer
        isOpen={rankIsOpen}
        placement="right"
        onClose={rankOnClose}
        finalFocusRef={btnRef1}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Flex alignItems="center">
              🏆 랭킹{" "}
              <FiRefreshCw
                size={12}
                style={{
                  marginLeft: "4px",
                  marginRight: "4px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  getRanking();
                }}
              />
              <Badge
                style={{
                  height: "25px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                colorScheme="teal"
                onClick={() => {
                  setIsLive(!isLive);
                }}
              >
                실시간
                {isLive ? (
                  <Badge ml={1} colorScheme="red" variant="outline">
                    ON
                  </Badge>
                ) : (
                  <Badge ml={1} colorScheme="blue" variant="outline">
                    OFF
                  </Badge>
                )}
              </Badge>
            </Flex>
          </DrawerHeader>

          <DrawerBody>
            <Table>
              <Thead>
                <Tr>
                  <Th>순위</Th>
                  <Th>이름</Th>
                  <Th>점수</Th>
                </Tr>
              </Thead>
              <Tbody>
                {ranking.map((item) => {
                  let cntItem = cnt;
                  if (cnt === 1) {
                    cntItem = "🥇";
                  } else if (cnt === 2) {
                    cntItem = "🥈";
                  } else if (cnt === 3) {
                    cntItem = "🥉";
                  }
                  cnt++;
                  return (
                    <Tr key={cnt}>
                      <Td
                        style={{
                          fontSize: cnt <= 4 ? "24px" : "16px",
                          textAlign: "center",
                        }}
                      >
                        {cntItem}
                      </Td>
                      <Td>{item.name}</Td>
                      <Td>{item.count.toLocaleString()}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </DrawerBody>

          <DrawerFooter>
            <Button
              variant="outline"
              colorScheme="teal"
              mr={3}
              onClick={rankOnClose}
            >
              닫기
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        isOpen={nameIsOpen}
        placement="right"
        onClose={nameOnClose}
        finalFocusRef={btnRef2}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>🎤 로그인/회원가입</DrawerHeader>

          <DrawerBody>
            <Heading size="md">로그인</Heading>
            {/* <Text>
              이름과 비밀번호를 입력한 뒤 페이지 하단 '설정' 버튼을 꼭
              눌러주세요.
            </Text> */}
            <br />
            <FormControl mb={1}>
              <FormLabel htmlFor="name">이름</FormLabel>
              <Input id="loginName" type="text" />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <Input id="loginPassword" type="password" />
              {/* <FormHelperText>
                8자 이상 입력해주세요. 비밀번호는 기록을 복구할 때 사용됩니다.
              </FormHelperText> */}
            </FormControl>
            <Button
              style={{ width: "100%" }}
              colorScheme="teal"
              onClick={loginSave}
            >
              로그인
            </Button>
            <br />
            <br />
            <Heading size="md" mt={4} mb={1}>
              회원가입
            </Heading>
            <br />
            <FormControl mb={1}>
              <FormLabel htmlFor="name">이름</FormLabel>
              <Input id="name" type="text" />
            </FormControl>
            <br />
            <FormControl mb={2}>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <Input id="password" type="password" />
              <FormHelperText>
                8자 이상 입력해주세요. 비밀번호는 기록을 복구할 때 사용됩니다.
              </FormHelperText>
            </FormControl>
            <Button
              style={{ width: "100%" }}
              colorScheme="teal"
              onClick={nameSave}
            >
              회원가입
            </Button>
          </DrawerBody>

          <DrawerFooter>
            <Button
              variant="outline"
              colorScheme="teal"
              mr={3}
              onClick={nameOnClose}
            >
              닫기
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        isOpen={settingIsOpen}
        placement="right"
        onClose={settingOnClose}
        finalFocusRef={btnRef2}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>🎤 계정 설정하기</DrawerHeader>

          <DrawerBody>
            <Heading size="md" mb={2}>
              계정 합치기
            </Heading>
            <Text>
              다른 이름으로 등록된 계정을 지금 로그인한 계정으로 합치는
              기능입니다. 현재 계정으로 옮길 계정을 입력해주세요.
              <Text style={{ fontWeight: 900, color: "red" }}>
                이 명령은 되돌릴 수 없으니 신중하게 실행해주세요.
              </Text>
            </Text>
            <br />
            <FormControl mb={1}>
              <FormLabel htmlFor="name">이름</FormLabel>
              <Input id="mergeName" type="text" />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <Input id="mergePassword" type="password" />
            </FormControl>
            <Button
              style={{ width: "100%" }}
              colorScheme="teal"
              onClick={mergeSave}
            >
              합치기
            </Button>
            <br />
            <br />
            <Heading size="md" mt={4} mb={2}>
              로그아웃
            </Heading>
            <Button
              style={{ width: "100%" }}
              colorScheme="teal"
              mb={2}
              onClick={logoutSave}
            >
              로그아웃
            </Button>
            <br />
            <br />
            <Heading size="md" mt={4} mb={2}>
              계정 삭제
            </Heading>
            <Text mb={2}>
              현재 로그인된 계정을 삭제하는 기능입니다.
              <Text style={{ fontWeight: 900, color: "red" }}>
                이 명령은 되돌릴 수 없으니 신중하게 실행해주세요.
              </Text>
            </Text>
            <Button
              style={{ width: "100%" }}
              colorScheme="red"
              mb={2}
              onClick={deleteOnOpen}
            >
              계정 삭제하기
            </Button>
          </DrawerBody>

          <DrawerFooter>
            <Button
              variant="outline"
              colorScheme="teal"
              mr={3}
              onClick={settingOnClose}
            >
              닫기
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog isOpen={deleteIsOpen} onClose={deleteOnClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              계정 삭제
            </AlertDialogHeader>

            <AlertDialogBody>
              정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={deleteOnClose}>취소</Button>
              <Button colorScheme="red" onClick={deleteSave} ml={3}>
                삭제
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Drawer
        isOpen={noticeIsOpen}
        placement="right"
        onClose={noticeOnClose}
        finalFocusRef={btnRef3}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>🚦 유의사항</DrawerHeader>

          <DrawerBody>
            <Heading size="md" mb={1}>
              랭킹 산정은?
            </Heading>
            <Text>
              매 1초마다 현재까지 누른 개수를 서버에 보내요. 단, 과도하게 많은
              횟수가 입력되면 부정행위로 판단해서 접속이 차단될 수 있어요.
            </Text>{" "}
            <br />
            <Heading size="md" mb={1}>
              내 기록을 다른 기계에서도 이용하고 싶어요
            </Heading>
            <Text>
              로그인 기능을 이용하면 다른 기계에서도 계속 이어서 누를 수 있어요.
            </Text>
            <br />
            <Heading size="md" mb={1}>
              계정이 여러 개인데 합칠 수 있나요?
            </Heading>
            <Text>
              계정 합치기 기능을 이용하면 여러 개의 계정을 하나로 합칠 수
              있어요. 하나로 모을 계정으로 먼저 로그인한 뒤, 계정 설정하기
              버튼을 누르면 합칠 계정의 이름과 비밀번호를 입력해 계정을 합칠 수
              있어요.
            </Text>
            <br />
            <Heading size="md" mb={1}>
              제 기록이 지워졌어요
            </Heading>
            <Text>
              시크릿 모드를 사용하거나, 쿠키 등 인터넷 사용기록을 삭제하면
              기록이 지워질 수 있어요. 지워진 기록은 복구되지 않으며, 새로운
              이름을 설정해서 시작해야해요 (기존 이름 이용 불가).
            </Text>
            <br />
            <Heading size="md" mb={1}>
              이미지는 언제 바뀌나요?
            </Heading>
            <Text>
              oh 이미지는 매 100클릭마다, 대깨 이미지는 5% 확률로 랜덤으로
              출력됩니다!
            </Text>
          </DrawerBody>

          <DrawerFooter>
            <Button
              variant="outline"
              colorScheme="teal"
              mr={3}
              onClick={noticeOnClose}
            >
              닫기
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default App;
