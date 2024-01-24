import React, {useEffect, useMemo} from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import {FaSave} from "react-icons/fa";


const SaveAsSceneModal: React.FC<{
  initialSceneName: string;
  initialSceneDescription: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveAsScene: (params: { sceneName: string, description: string }) => Promise<void>;
}> = ({initialSceneName, initialSceneDescription, isOpen, onClose, onSaveAsScene}) => {
  const [sceneName, setSceneName] = React.useState("");
  const [sceneDescription, setSceneDescription] = React.useState("");
  const toast = useToast();

  const [isSaving, setIsSaving] = React.useState(false);

  const isValid = useMemo(() => {
    return sceneName.length > 0;
  }, [sceneName]);

  // Reset search when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSceneName(initialSceneName);
      setSceneDescription(initialSceneDescription);
    }
  }, [isOpen]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay/>
        <ModalContent maxW="40em">
          <ModalHeader>Save new scene to server</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <Flex gap={2} flexDirection={"column"}>
              <FormControl isRequired>
                <FormLabel>Scene name</FormLabel>
                <Input placeholder="Scene name" value={sceneName} onChange={(e) => setSceneName(e.target.value)}/>
              </FormControl>
              <FormControl>
                <FormLabel>Scene description</FormLabel>
                <Textarea placeholder="Scene description" value={sceneDescription}
                          maxLength={512}
                          onChange={(e) => setSceneDescription(e.target.value)}/>
              </FormControl>

              {/*<InputGroup>*/}
              {/*  <InputLeftElement pointerEvents="none">*/}
              {/*    <SearchIcon color="gray.300"/>*/}
              {/*  </InputLeftElement>*/}
              {/*  <Input type="text" placeholder="Seach Scene" value={sceneName}*/}
              {/*         onChange={(e) => setSceneName(e.target.value)}*/}
              {/*  />*/}
              {/*  <InputRightElement>*/}
              {/*    <IconButton size={"sm"} aria-label="Search database" icon={<SearchIcon/>}/>*/}
              {/*  </InputRightElement>*/}
              {/*</InputGroup>*/}
              {/*<Text color="red">{error?.message}</Text>*/}
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsSaving(true);
                  const promise = onSaveAsScene({
                    sceneName,
                    description: sceneDescription,
                  });
                  toast.promise(promise, {
                    success: {title: "Scene saved", description: "Scene saved successfully", isClosable: true},
                    error: {
                      title: "Error saving scene",
                      description: "There was an error saving the scene,\nSee console for additional information.",
                      isClosable: true,
                    },
                    loading: {title: "Saving scene", description: "Please wait"},
                  });
                  await promise;
                  onClose();
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsSaving(false);
                }
              }}
              colorScheme="blue"
              isLoading={isSaving}
              leftIcon={<FaSave/>}
              isDisabled={!isValid}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SaveAsSceneModal;
