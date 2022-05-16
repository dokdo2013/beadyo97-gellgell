import {
  Box,
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
    isOpen: noticeIsOpen,
    onOpen: noticeOnOpen,
    onClose: noticeOnClose,
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

  const baseUrl = "https://api-v1.leaven.team";
  // const baseUrl = "http://0.0.0.0:9091";

  useEffect(() => {
    onLoad();

    // 타이머 설정
    setInterval(() => {
      save();
    }, 1000);
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
        });
    }
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
        <Flex justifyContent="center">
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
              🎤 이름 정하기
            </Button>
          ) : (
            <Button
              ref={btnRef2}
              colorScheme="teal"
              variant="outline"
              onClick={() => {
                toast({
                  title: "준비 중",
                  description: "현재 '이름 변경하기' 기능은 준비 중입니다.",
                  status: "warning",
                  position: "bottom",
                  duration: 10000,
                  isClosable: true,
                });
              }}
              mr={2}
              isLoading={isLoading}
            >
              🎤 이름 변경하기
            </Button>
          )}
          <Button
            ref={btnRef3}
            colorScheme="teal"
            variant="outline"
            onClick={noticeOnOpen}
            mr={2}
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
              ? "먼저 이름을 설정하셔야 랭킹에 등록됩니다. '이름 정하기' 버튼을 눌러보세요!"
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
                style={{ marginLeft: "4px", cursor: "pointer" }}
                onClick={() => {
                  getRanking();
                }}
              />
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
                      <Td>{item.count}</Td>
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
          <DrawerHeader>🎤 이름 정하기</DrawerHeader>

          <DrawerBody>
            <Text>
              이름과 비밀번호를 입력한 뒤 페이지 하단 '설정' 버튼을 꼭
              눌러주세요.
            </Text>
            <br />
            <FormControl>
              <FormLabel htmlFor="name">이름</FormLabel>
              <Input id="name" type="text" />
            </FormControl>
            <br />
            <FormControl>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <Input id="password" type="password" />
              <FormHelperText>
                8자 이상 입력해주세요. 비밀번호는 기록을 복구할 때 사용됩니다.
              </FormHelperText>
            </FormControl>
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
            <Button onClick={nameSave} colorScheme="teal">
              설정
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
            <Heading size="md">랭킹 산정은?</Heading>
            <Text>
              매 1초마다 현재까지 누른 개수를 서버에 보내요. 단, 과도하게 많은
              횟수가 입력되면 부정행위로 판단해서 접속이 차단될 수 있어요.
            </Text>{" "}
            <br />
            <Heading size="md">
              내 기록을 다른 기계에서도 이용하고 싶어요
            </Heading>
            <Text>
              현재는 기록 이전을 지원하지 않아요. 하나의 기계, 하나의
              브라우저에서만 우선 이용할 수 있다는 점 참고 부탁드려요.
            </Text>
            <br />
            <Heading size="md">제 기록이 지워졌어요</Heading>
            <Text>
              시크릿 모드를 사용하거나, 쿠키 등 인터넷 사용기록을 삭제하면
              기록이 지워질 수 있어요. 지워진 기록은 복구되지 않으며, 새로운
              이름을 설정해서 시작해야해요 (기존 이름 이용 불가).
            </Text>
            <br />
            <Heading size="md">이미지는 언제 바뀌나요?</Heading>
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
