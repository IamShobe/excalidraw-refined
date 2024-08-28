import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Center,
  Divider,
  Flex,
  Heading,
  IconButton,
  Image,
  Stack,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { MdDelete, MdOpenInBrowser } from "react-icons/md";
import scenePlaceholder from "./assets/scene_placeholder.png";
import { SceneSummary } from "./gen/model";


const SceneCard: React.FC<{
  scene: SceneSummary;
  onDeleteClicked: () => Promise<void>;
  onLoadClicked: () => void;
}> = ({scene, onLoadClicked, onDeleteClicked}) => {
  const toast = useToast();
  const [imgSrc, setImgSrc] = React.useState(scene.picture);
  const [isDeleted, setIsDeleted] = React.useState(false);

  return (
    <Card>
      <CardBody>
        <Center w="100%" h="150px" p={4} color="white">
          <Image
            src={imgSrc}
            maxH={"100%"}
            maxW={"100%"}
            objectFit="cover"
            borderRadius="lg"
            onError={(e) => {
              e.stopPropagation();
              setImgSrc(scenePlaceholder);
            }}
          />
        </Center>
        <Stack mt="2" spacing="3">
          <Heading size="md">{scene.name}</Heading>
          <Box borderWidth="1px" borderRadius="lg" p={2} height="5em" overflow="auto">
            {
              scene.description ? <Text>{scene.description}</Text> : <Text color="gray.500">No description</Text>
            }
          </Box>
        </Stack>
        <Flex position="absolute" top="2">
          {
            isDeleted && <Badge colorScheme="red">Deleted</Badge>
          }
        </Flex>
      </CardBody>
      <Divider/>
      <CardFooter>
        <ButtonGroup spacing="2" isDisabled={isDeleted}>
          <Tooltip label="Load Scene">
            <Button variant="solid" onClick={onLoadClicked} colorScheme="blue" leftIcon={<MdOpenInBrowser/>}>
              Load
            </Button>
          </Tooltip>
          {/* TODO: implement... */}
          {/*<Tooltip label="Download as file">*/}
          {/*  <IconButton aria-label={"Download"} icon={<FaFileDownload/>} variant="outline" colorScheme="blue"*/}
          {/*              onClick={() => {*/}
          {/*              }}/>*/}
          {/*</Tooltip>*/}
          <Tooltip label="Delete Scene">
            <IconButton aria-label={"Delete"} icon={<MdDelete/>} variant="outline" colorScheme="red"
                        onClick={async () => {
                          const promise = onDeleteClicked();
                          toast.promise(promise, {
                            success: {
                              title: "Scene deleted",
                              description: "Scene deleted successfully",
                              isClosable: true,
                            },
                            error: {
                              title: "Error deleting scene",
                              description: "There was an error deleting the scene,\nSee console for additional information.",
                              isClosable: true,
                            },
                            loading: {title: "Deleting scene", description: "Please wait"},
                          });
                          await promise;
                          setIsDeleted(true); // lasy delete
                        }}/>
          </Tooltip>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};

export default SceneCard;