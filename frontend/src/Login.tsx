import { Formik, Field } from "formik";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    VStack,
    Divider,
} from "@chakra-ui/react";
import axios from "axios";

import { wrapOAuth2Authorize } from "./utils/oauth2Wrapper";


const Comp = () => {
    return <button onClick={async () => {
        const resp = await axios.get<{ authorization_url: string }>('/api/v1/auth/google/authorize');
        wrapOAuth2Authorize(resp.data.authorization_url).addRedirectPath("/callback/google").authorize();
    }}>login google</button>
}

export const Login = () => {

    return (
        <Flex bg="gray.100" align="center" justify="center" h="100vh">
            <Box bg="white" p={6} rounded="md" w="md">
                <Formik
                    initialValues={{
                        email: "",
                        password: "",
                    }}
                    onSubmit={(values) => {
                        alert(JSON.stringify(values, null, 2));
                    }}
                >
                    {({ handleSubmit, errors, touched }) => (
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4} align="flex-start">
                                <FormControl>
                                    <FormLabel htmlFor="email">Email Address</FormLabel>
                                    <Field
                                        as={Input}
                                        id="email"
                                        name="email"
                                        type="email"
                                        variant="filled"
                                    />
                                </FormControl>
                                <FormControl isInvalid={!!errors.password && touched.password}>
                                    <FormLabel htmlFor="password">Password</FormLabel>
                                    <Field
                                        as={Input}
                                        id="password"
                                        name="password"
                                        type="password"
                                        variant="filled"
                                        validate={(value: string) => {
                                            let error;

                                            if (value.length < 6) {
                                                error = "Password must contain at least 6 characters";
                                            }

                                            return error;
                                        }}
                                    />
                                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                                </FormControl>
                                <Button type="submit" width="full" colorScheme="blue">
                                    Login
                                </Button>
                                <Divider />
                                Social login here
                                <Comp />
                            </VStack>
                        </form>
                    )}
                </Formik>
            </Box>
        </Flex>
    );
}

export default Login;
