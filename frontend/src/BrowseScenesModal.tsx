import React, {useEffect, useMemo} from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons";
import {IoMdRefresh} from "react-icons/io";
import InfiniteScroll from "react-infinite-scroll-component";
import {useDebounce} from "react-use";
import {useQueryClient} from "@tanstack/react-query";
import {useScenes} from "./api-hooks.ts";
import SceneCard from "./SceneCard.tsx";


const BrowseScenesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  loadScene: (sceneId: string) => void;
  deleteScene: (sceneId: string) => Promise<void>;
}> = ({isOpen, onClose, loadScene, deleteScene}) => {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);

  useDebounce(
    () => {
      setDebouncedSearch(search);
    },
    500,
    [search],
  );

  // Reset search when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const client = useQueryClient();

  const {isLoading, error, data, fetchNextPage, hasNextPage} = useScenes({
    enabled: isOpen,
    search: debouncedSearch,
  });


  const currentCount = useMemo(() => {
    if (!data) {
      return 0;
    }

    return data.pages.map((page) => page.items.length).reduce((a, b) => a + b, 0);
  }, [data]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay/>
        <ModalContent maxW="80em">
          <ModalHeader>Browse scenes from server</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <Flex gap={2} flexDirection={"column"}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300"/>
                </InputLeftElement>
                <Input type="text" placeholder="Seach Scene" value={search}
                       onChange={(e) => setSearch(e.target.value)}
                />
                <InputRightElement>
                  <Tooltip label={"Refresh database"}>
                    <IconButton size={"sm"} aria-label="Refresh database" icon={<IoMdRefresh/>} onClick={async () => {
                      await client.resetQueries({queryKey: ["scenes"]});
                    }}/>
                  </Tooltip>
                </InputRightElement>
              </InputGroup>
              {
                error && <Text color="red">{error?.message}</Text>
              }
              {
                isLoading ? <Center>
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
                    size="xl"
                  />
                </Center> : (
                  <Box borderWidth="1px" borderRadius="lg">
                    <InfiniteScroll
                      dataLength={currentCount}
                      next={fetchNextPage}
                      hasMore={hasNextPage}
                      scrollThreshold={1}
                      loader={<Progress size="xs" isIndeterminate/>}
                      endMessage={
                        <p style={{textAlign: "center"}}>
                          <b>Yay! You have seen it all</b>
                        </p>
                      }
                      height="30em"
                    >
                      <Grid templateColumns="repeat(auto-fill, minmax(20em, 1fr))" gap={6} padding={2}>
                        {
                          data?.pages.map((page) => {
                            return page.items.map((scene) =>
                              <GridItem key={scene.id}>
                                <SceneCard scene={scene}
                                           onDeleteClicked={async () => {
                                              await deleteScene(scene.id);
                                           }}
                                           onLoadClicked={() => {
                                             loadScene(scene.id);
                                             onClose();
                                           }}/>
                              </GridItem>,
                            );
                          }).flat()
                        }
                      </Grid>
                    </InfiniteScroll>
                  </Box>
                )
              }
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BrowseScenesModal;
