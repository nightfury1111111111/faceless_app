import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, utils } from "@project-serum/anchor";
import Reveal from "react-awesome-reveal";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAccount,
} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { getOrCreateAssociatedTokenAccount } from "../../utils/transferSpl/getOrCreateAssociatedTokenAccount";
import { getAssociatedTokenAddress } from "../../utils/transferSpl/getAssociatedTokerAddress";
import { getAccountInfo } from "../../utils/transferSpl/getAccountInfo";
import { createAssociatedTokenAccountInstruction } from "../../utils/transferSpl/createAssociatedTokenAccountInstruction";

import { Idl, seed } from "@project-serum/anchor/dist/cjs/idl";
import React, { Component, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { PublicKey, Transaction } from "@solana/web3.js";
import Footer from "../../components/footer";
import idl from "../../idl.json";

import { constants } from "../../constants";
import { shortenAddress, validateAddress } from "../../utils/general";
import { useAtom } from "jotai";
import {
  dashboardStage,
  isLoadingOverlay,
  profile,
  profileModerators,
} from "../../utils/store";
import axios from "axios";
import { async } from "q";
import { fadeInRightShorter } from "../../utils/keyframes";

export interface EscrowData {
  randomSeed: number;
  disputeStatus: boolean;
  initializerKey: PublicKey;
  initializerAmount: Array<number>;
  taker: PublicKey;
  mint: PublicKey;
  pubkey: PublicKey;
  active: boolean;
  index: number;
  offchainData: any;
}

export interface AdminData {
  adminFee: number;
  resolverFee: number;
  admin1: PublicKey;
  admin2: PublicKey;
  resolver: PublicKey;
}

const programID = new PublicKey(idl.metadata.address);
const { adminSeed, stateSeed, vaultSeed, authoritySeed } = constants;

const Home = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, signTransaction, signAllTransactions } =
    useWallet();

  const [myTokenAddress, setMyTokenAddress] = useState("");
  const [faqNum, setFaqNum] = useState(0);
  const [stage, setStage] = useAtom(dashboardStage);
  const [currentEscrow, setCurrentEscrow] = useState(0);

  const [adminData, setAdminData] = useState<AdminData>();
  const [escrowData, setEscrowData] = useState<EscrowData[]>([]);
  const [escrowRestData, setEscrowRestData] = useState<any>({});
  const [escrowOffchainData, setEscrowOffchainData] = useState();
  const [totalValue, setTotalValue] = useState(0);
  const [myStatus, setMyStatus] = useState("active");
  const [forMeStatus, setForMeStatus] = useState("active");
  const [showModerator, setModeratorVisibility] = useState(false);
  const [useModerator, setUseModerator] = useState(true);

  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [selectedMilestone, setSelectedMilestone] = useState(0);
  const [description, setDescription] = useState("");
  const [receiver, setReceiver] = useState("");
  const [moderator, setModerator] = useState("");
  const [amount, setAmount] = useState(0);
  const [milestone1, setMilestone1] = useState("");
  const [amount1, setAmount1] = useState(0);
  const [milestone2, setMilestone2] = useState("");
  const [amount2, setAmount2] = useState(0);
  const [milestone3, setMilestone3] = useState("");
  const [amount3, setAmount3] = useState(0);
  const [milestone4, setMilestone4] = useState("");
  const [amount4, setAmount4] = useState(0);
  const [milestone5, setMilestone5] = useState("");
  const [amount5, setAmount5] = useState(0);

  //define error
  const [descriptionErr, setDescriptionErr] = useState("");
  const [receiverErr, setReceiverErr] = useState("");
  const [amountErr, setAmountErr] = useState("");
  const [milestone1Err, setMilestone1Err] = useState("");
  const [amount1Err, setAmount1Err] = useState("");
  const [milestone2Err, setMilestone2Err] = useState("");
  const [amount2Err, setAmount2Err] = useState("");
  const [milestone3Err, setMilestone3Err] = useState("");
  const [amount3Err, setAmount3Err] = useState("");
  const [milestone4Err, setMilestone4Err] = useState("");
  const [amount4Err, setAmount4Err] = useState("");
  const [milestone5Err, setMilestone5Err] = useState("");
  const [amount5Err, setAmount5Err] = useState("");

  const [user] = useAtom(profile);
  const [moderators] = useAtom(profileModerators);
  const [isLoading, setLoading] = useAtom(isLoadingOverlay);
  const [isWalletConnected, setWalletConnected] = useState(false);

  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const opts = {
    preflightCommitment: "processed",
  };

  // useEffect(() => {
  //   setAmount(
  //     Number(amount1) +
  //       Number(amount2) +
  //       Number(amount3) +
  //       Number(amount4) +
  //       Number(amount5)
  //   );
  // }, [amount1, amount2, amount3, amount4, amount5]);

  useEffect(() => {
    setTimeout(() => {
      setWalletConnected(true);
    }, 200);
  }, [publicKey]);

  const getEscrowDate = (seed: number) => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_SERVER_URL}/escrows/${seed}`,
    }).then((result) => {
      console.log(result.data);
      let date = new Date(result.data.created_at).toLocaleDateString("en");
      setEscrowRestData({ ...result.data, date: date });
    });
  };

  const resetMilestone = () => {
    setCurrentMilestone(0);
    setMilestone1("");
    setAmount1(0);
    setMilestone2("");
    setAmount2(0);
    setMilestone3("");
    setAmount3(0);
    setMilestone4("");
    setAmount4(0);
    setMilestone5("");
    setAmount5(0);
  };

  const resetError = () => {
    setDescriptionErr("");
    setReceiverErr("");
    setAmountErr("");
    setMilestone1Err("");
    setAmount1Err("");
    setMilestone2Err("");
    setAmount2Err("");
    setMilestone3Err("");
    setAmount3Err("");
    setMilestone4Err("");
    setAmount4Err("");
    setMilestone5Err("");
    setAmount5Err("");
  };

  const inputNumberAmount = (val: any, func: Function) => {
    if (!val || val == 0) setAmount(0);

    func(val.toString().replace(/^0+/, ""));
  };

  // useEffect(() => {
  //   console.log("dsfffff", amount);
  // }, [amount]);

  const toggleModerator = (add: string) => {
    setModerator(add);
    setModeratorVisibility(false);
  };

  const isValidEscrow = () => {
    let status = true;
    console.log(
      currentMilestone > 0,
      amount,
      amount1 + amount2 + amount3 + amount4 + amount5
    );
    if (
      currentMilestone > 0 &&
      Number(amount) !==
        Number(amount1) +
          Number(amount2) +
          Number(amount3) +
          Number(amount4) +
          Number(amount5)
    ) {
      setAmountErr("Must be matched to total amount of milestones!");
      status = false;
    }
    if (!validateAddress(receiver)) {
      setReceiverErr("Invalid address");
      status = false;
    }
    if (description == "") {
      setDescriptionErr("Name is required");
      status = false;
    } else setDescriptionErr("");
    if (receiver == "") {
      setReceiverErr("Receiver is required");
      status = false;
    }
    if (amount == 0) {
      setAmountErr("Amount is required");
      status = false;
    }
    if (currentMilestone > 0) {
      if (milestone1 == "") {
        setMilestone1Err("Milestone name is required");
        status = false;
      } else setMilestone1Err("");
      if (amount1 == 0) {
        setAmount1Err("Amount is required");
        status = false;
      } else setAmount1Err("");
    }
    if (currentMilestone > 1) {
      if (milestone2 == "") {
        setMilestone2Err("Milestone name is required");
        status = false;
      } else setMilestone2Err("");
      if (amount2 == 0) {
        setAmount2Err("Amount is required");
        status = false;
      } else setAmount2Err("");
    }
    if (currentMilestone > 2) {
      if (milestone3 == "") {
        setMilestone3Err("Milestone name is required");
        status = false;
      } else setMilestone3Err("");
      if (amount3 == 0) {
        setAmount3Err("Amount is required");
        status = false;
      } else setAmount3Err("");
    }
    if (currentMilestone > 3) {
      if (milestone4 == "") {
        setMilestone4Err("Milestone name is required");
        status = false;
      } else setMilestone4Err("");
      if (amount4 == 0) {
        setAmount4Err("Amount is required");
        status = false;
      } else setAmount4Err("");
    }
    if (currentMilestone > 4) {
      if (milestone5 == "") {
        setMilestone5Err("Milestone name is required");
        status = false;
      } else setMilestone5Err("");
      if (amount5 == 0) {
        setAmount5Err("Amount is required");
        status = false;
      } else setAmount5Err("");
    }
    return status;
  };

  const getProvider = () => {
    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
      return;
    }
    const signerWallet = {
      publicKey: publicKey,
      signTransaction: signTransaction,
      signAllTransactions: signAllTransactions,
    };

    const provider = new AnchorProvider(connection, signerWallet, {
      preflightCommitment: "recent",
    });

    return provider;
  };

  const createEscrow = async () => {
    if (isLoading1) return;
    if (!isValidEscrow()) return;
    resetError();
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);

    const mint = new PublicKey(constants.mint);
    const receiverAddress = new PublicKey(receiver);
    // const resolver = new PublicKey(useModerator ? moderator : receiverAddress);

    // let receiverAssiciatedToken = await getAssociatedTokenAddress(
    //   mint,
    //   receiverAddress,
    //   false,
    //   TOKEN_PROGRAM_ID,
    //   ASSOCIATED_TOKEN_PROGRAM_ID
    // );

    // let resolverAssiciatedToken = await getAssociatedTokenAddress(
    //   mint,
    //   resolver,
    //   false,
    //   TOKEN_PROGRAM_ID,
    //   ASSOCIATED_TOKEN_PROGRAM_ID
    // );

    let initializerAssiciatedToken = await getAssociatedTokenAddress(
      mint,
      publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction();
    let account;
    // try {
    //   account = await getAccountInfo(
    //     connection,
    //     receiverAssiciatedToken,
    //     undefined,
    //     TOKEN_PROGRAM_ID
    //   );
    // } catch (error: any) {
    //   if (
    //     error.message === "TokenAccountNotFoundError" ||
    //     error.message === "TokenInvalidAccountOwnerError"
    //   ) {
    //     transaction.add(
    //       createAssociatedTokenAccountInstruction(
    //         publicKey,
    //         receiverAssiciatedToken,
    //         receiverAddress,
    //         mint,
    //         TOKEN_PROGRAM_ID,
    //         ASSOCIATED_TOKEN_PROGRAM_ID
    //       )
    //     );
    //   }
    // }

    // try {
    //   account = await getAccountInfo(
    //     connection,
    //     resolverAssiciatedToken,
    //     undefined,
    //     TOKEN_PROGRAM_ID
    //   );
    // } catch (error: any) {
    //   if (
    //     error.message === "TokenAccountNotFoundError" ||
    //     error.message === "TokenInvalidAccountOwnerError"
    //   ) {
    //     transaction.add(
    //       createAssociatedTokenAccountInstruction(
    //         publicKey,
    //         resolverAssiciatedToken,
    //         resolver,
    //         mint,
    //         TOKEN_PROGRAM_ID,
    //         ASSOCIATED_TOKEN_PROGRAM_ID
    //       )
    //     );
    //   }
    // }

    try {
      account = await getAccountInfo(
        connection,
        initializerAssiciatedToken,
        undefined,
        TOKEN_PROGRAM_ID
      );
    } catch (error: any) {
      if (
        error.message === "TokenAccountNotFoundError" ||
        error.message === "TokenInvalidAccountOwnerError"
      ) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            initializerAssiciatedToken,
            publicKey,
            mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }

    const randomSeed: anchor.BN = new anchor.BN(
      Math.floor(Math.random() * 100000000)
    );

    // Derive PDAs: escrowStateKey, vaultKey, vaultAuthorityKey
    const adminKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        Buffer.from(anchor.utils.bytes.utf8.encode(adminSeed)),
      ],
      program.programId
    )[0];
    const escrowStateKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        randomSeed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    const vaultKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(vaultSeed)),
        randomSeed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    let seed = randomSeed;

    // save info to backend
    const milestones =
      currentMilestone === 0
        ? [
            {
              mileston: description,
              amount: amount,
            },
          ]
        : [
            {
              mileston: milestone1,
              amount: amount1,
            },
            {
              mileston: milestone2,
              amount: amount2,
            },
            {
              mileston: milestone3,
              amount: amount3,
            },
            {
              mileston: milestone4,
              amount: amount4,
            },
            {
              mileston: milestone5,
              amount: amount5,
            },
          ];

    axios({
      method: "post",
      url: `${process.env.REACT_APP_SERVER_URL}/escrows`,
      data: {
        description: description,
        seed: seed.toString(10),
        receiver: receiverAddress,
        moderator: receiverAddress, // ignore
        amount: amount,
        milestones: milestones,
      },
    });

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana

      const tx = await program.transaction.initialize(
        seed,
        currentMilestone === 0
          ? [
              new anchor.BN(amount * 1e9),
              new anchor.BN(0),
              new anchor.BN(0),
              new anchor.BN(0),
              new anchor.BN(0),
            ]
          : [
              new anchor.BN(amount1 * 1e9),
              new anchor.BN(amount2 * 1e9),
              new anchor.BN(amount3 * 1e9),
              new anchor.BN(amount4 * 1e9),
              new anchor.BN(amount5 * 1e9),
            ],
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            vault: vaultKey,
            adminState: adminKey,
            // resolverTokenAccount: resolverAssiciatedToken,
            mint,
            initializerDepositTokenAccount: initializerAssiciatedToken,
            taker: receiverAddress,
            // takerTokenAccount: receiverAssiciatedToken,
            escrowState: escrowStateKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [],
        }
      );
      transaction.add(tx);
      transaction.feePayer = provider.wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const signedTx = await provider.wallet.signTransaction(transaction);
      setIsLoading1(true);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setIsLoading1(false);
      toast("Escrow is successfully created.");
      setStage(0);

      //reset data
      setDescription("");
      setReceiver("");
      setAmount(0);
      resetMilestone();
    } catch (err) {
      console.log(err);
      setIsLoading1(false);
      toast("Action failed. Try again");

      axios({
        method: "delete",
        url: `${process.env.REACT_APP_SERVER_URL}/escrows/${seed}`,
      });
    }
  };

  const getEscrow = async () => {
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);
    const mint = new PublicKey(constants.mint);
    let myAssiciatedToken = await getAssociatedTokenAddress(
      mint,
      publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    setMyTokenAddress(myAssiciatedToken.toString());
    try {
      const adminKey = PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
          Buffer.from(anchor.utils.bytes.utf8.encode(adminSeed)),
        ],
        program.programId
      )[0];
      let tmpLockedval = 0;
      await Promise.all(
        (
          await connection.getProgramAccounts(programID)
        ).map(
          async (
            tx,
            index //no need to write smartcontract to get the data, just pulling all transaction respective programID and showing to user
          ) => {
            if (tx.pubkey.toString() === adminKey.toString()) {
              const fetchData: any = await program.account.adminState.fetch(
                tx.pubkey
              );
              const newData = {
                ...fetchData,
                adminFee: Number(fetchData.adminFee),
                resolverFee: Number(fetchData.resolverFee),
              };
              console.log("admin data", newData);
              setAdminData(newData);
              return true;
            }
            const fetchData: any = await program.account.escrowState.fetch(
              tx.pubkey
            );
            let offchainData;
            try {
              offchainData = await axios({
                method: "get",
                url: `${process.env.REACT_APP_SERVER_URL}/escrows/${Number(
                  fetchData.randomSeed
                )}`,
              });
            } catch (err) {
              toast("Server Error");
              return;
            }
            const newData = {
              ...fetchData,
              initializerAmount: [
                Number(fetchData.initializerAmount[0] / 1e9),
                Number(fetchData.initializerAmount[1] / 1e9),
                Number(fetchData.initializerAmount[2] / 1e9),
                Number(fetchData.initializerAmount[3] / 1e9),
                Number(fetchData.initializerAmount[4] / 1e9),
              ],
              randomSeed: Number(fetchData.randomSeed),
              offchainData: offchainData.data,
            };
            const lockedVal =
              newData.initializerAmount[0] +
              newData.initializerAmount[1] +
              newData.initializerAmount[2] +
              newData.initializerAmount[3] +
              newData.initializerAmount[4];
            tmpLockedval += lockedVal;
            return {
              ...newData,
              pubkey: tx.pubkey.toString(),
              active: lockedVal > 0 ? true : false,
            };
          }
        )
      ).then((tmpResult) => {
        tmpResult.splice(tmpResult.indexOf(true), 1);
        const result = tmpResult.map((escr, idx) => {
          return { ...escr, index: idx };
        });
        result.sort((a, b) => {
          return b.offchainData.created_at - a.offchainData.created_at;
        });
        setTotalValue(tmpLockedval);
        setEscrowData(result);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const approvePayment = async () => {
    if (isLoading1) return;
    if (!adminData) return;
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);

    const adminKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        Buffer.from(anchor.utils.bytes.utf8.encode(adminSeed)),
      ],
      program.programId
    )[0];

    const escrowStateKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        new anchor.BN(escrowData[currentEscrow].randomSeed).toArrayLike(
          Buffer,
          "le",
          8
        ),
      ],
      program.programId
    )[0];

    const vaultKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(vaultSeed)),
        new anchor.BN(escrowData[currentEscrow].randomSeed).toArrayLike(
          Buffer,
          "le",
          8
        ),
      ],
      program.programId
    )[0];

    const vaultAuthorityKey = PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode(authoritySeed))],
      program.programId
    )[0];

    let takerAssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      escrowData[currentEscrow].taker,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let admin1AssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      adminData.admin1,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let admin2AssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      adminData.admin2,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction();
    let account;

    try {
      account = await getAccountInfo(
        connection,
        takerAssiciatedToken,
        undefined,
        TOKEN_PROGRAM_ID
      );
    } catch (error: any) {
      if (
        error.message === "TokenAccountNotFoundError" ||
        error.message === "TokenInvalidAccountOwnerError"
      ) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            takerAssiciatedToken,
            escrowData[currentEscrow].taker,
            escrowData[currentEscrow].mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }

    try {
      account = await getAccountInfo(
        connection,
        admin1AssiciatedToken,
        undefined,
        TOKEN_PROGRAM_ID
      );
    } catch (error: any) {
      if (
        error.message === "TokenAccountNotFoundError" ||
        error.message === "TokenInvalidAccountOwnerError"
      ) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            admin1AssiciatedToken,
            adminData.admin1,
            escrowData[currentEscrow].mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }

    try {
      account = await getAccountInfo(
        connection,
        admin2AssiciatedToken,
        undefined,
        TOKEN_PROGRAM_ID
      );
    } catch (error: any) {
      if (
        error.message === "TokenAccountNotFoundError" ||
        error.message === "TokenInvalidAccountOwnerError"
      ) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            admin2AssiciatedToken,
            adminData.admin2,
            escrowData[currentEscrow].mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
    }

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.approve(
        new anchor.BN(selectedMilestone),
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            adminState: adminKey,
            admin1TokenAccount: admin1AssiciatedToken,
            admin2TokenAccount: admin2AssiciatedToken,
            takerTokenAccount: takerAssiciatedToken,
            vault: vaultKey,
            vaultAuthority: vaultAuthorityKey,
            escrowState: escrowStateKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [],
        }
      );
      transaction.add(tx);
      transaction.feePayer = provider.wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const signedTx = await provider.wallet.signTransaction(transaction);
      setIsLoading1(true);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setIsLoading1(false);
      toast("Sent payment to receiver successfully.");
      setSelectedMilestone(0);
      getEscrow();
    } catch (err) {
      // console.log(err.message);
      setIsLoading1(false);
      toast("Action failed. Try again");
      console.log(err);
    }
  };

  const refundPayment = async () => {
    if (isLoading1) return;
    if (!adminData) return;
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);

    const adminKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        Buffer.from(anchor.utils.bytes.utf8.encode(adminSeed)),
      ],
      program.programId
    )[0];

    const escrowStateKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        new anchor.BN(escrowData[currentEscrow].randomSeed).toArrayLike(
          Buffer,
          "le",
          8
        ),
      ],
      program.programId
    )[0];

    const vaultKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(vaultSeed)),
        new anchor.BN(escrowData[currentEscrow].randomSeed).toArrayLike(
          Buffer,
          "le",
          8
        ),
      ],
      program.programId
    )[0];

    const vaultAuthorityKey = PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode(authoritySeed))],
      program.programId
    )[0];

    let initializerAssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      escrowData[currentEscrow].initializerKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let admin1AssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      adminData.admin1,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let admin2AssiciatedToken = await getAssociatedTokenAddress(
      escrowData[currentEscrow].mint,
      adminData.admin2,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction();
    let account;

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.refund({
        accounts: {
          taker: provider.wallet.publicKey,
          adminState: adminKey,
          admin1TokenAccount: admin1AssiciatedToken,
          admin2TokenAccount: admin2AssiciatedToken,
          initializerDepositTokenAccount: initializerAssiciatedToken,
          vault: vaultKey,
          vaultAuthority: vaultAuthorityKey,
          escrowState: escrowStateKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [],
      });
      transaction.add(tx);
      transaction.feePayer = provider.wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const signedTx = await provider.wallet.signTransaction(transaction);
      setIsLoading1(true);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setIsLoading1(false);
      toast("Sent payment to creator successfully.");
      setSelectedMilestone(0);
      getEscrow();
    } catch (err) {
      // console.log(err.message);
      setIsLoading1(false);
      toast("Action failed. Try again");
      console.log(err);
    }
  };

  const dispute = async () => {
    if (isLoading2) return;
    if (!adminData) return;
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);

    const adminKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        Buffer.from(anchor.utils.bytes.utf8.encode(adminSeed)),
      ],
      program.programId
    )[0];

    const escrowStateKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        new anchor.BN(escrowData[currentEscrow].randomSeed).toArrayLike(
          Buffer,
          "le",
          8
        ),
      ],
      program.programId
    )[0];

    const transaction = new Transaction();
    let account;

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.dispute({
        accounts: {
          disputor: provider.wallet.publicKey,
          adminState: adminKey,
          escrowState: escrowStateKey,
        },
        signers: [],
      });
      transaction.add(tx);
      transaction.feePayer = provider.wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const signedTx = await provider.wallet.signTransaction(transaction);
      setIsLoading2(true);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setIsLoading2(false);
      toast("Disputed successfully.");
      setSelectedMilestone(0);
      getEscrow();
    } catch (err) {
      // console.log(err.message);
      setIsLoading2(false);
      toast("Action failed. Try again");
      console.log(err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (stage === 0) getEscrow();
    if (stage === 1) resetError();
  }, [wallet, publicKey, signTransaction, signAllTransactions, stage]);

  return !isWalletConnected || !publicKey ? (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      <div className="bg-new-splash bg-cover w-[70vw] md:w-[30vw] h-[calc(70vw*2262/3056)] md:h-[calc(30vw*2262/3056)]"></div>
      {/* <img
        src="/images/splash.png"
        width={1920}
        height={1080}
        alt="splash"
        className="w-[100vw] h-[100vh] fixed object-cover"
      ></img> */}

      <div className="fixed bottom-[100px] left-0 w-full">
        <div className="text-[18px] leading-[21px] text-center">
          @ {new Date().getFullYear()} Faceless Labs
        </div>
        <div className="mt-[14px] flex justify-center">
          <a
            className="w-[30px] h-[30px] bg-discord bg-cover cursor-pointer hover:brightness-50"
            href={"https://discord.com/invite/HRhdNPhB2A"}
            target="_blank"
            rel="noreferrer"
          ></a>
          <a
            className="ml-[24px] w-[30px] h-[30px] bg-twitter bg-cover cursor-pointer hover:brightness-50"
            href={"https://twitter.com/facelesslabsnft"}
            target="_blank"
            rel="noreferrer"
          ></a>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-[100vh] sm:px-[49px] px-[20px] pb-[20px]">
      {stage === 0 && (
        <div>
          <div className="font-[600] md:text-[40px] text-[30px] pt-[130px]">
            Dashboard
          </div>
          <div className="mt-[14px] md:text-[14px] text-[12px] leading-[21px] font-[300]">
            Overview of your escrows and performance.
          </div>
          <div className="mt-[35px] grid md:grid-cols-3 grid-cols-1 gap-4">
            <div className="rounded-[10px] bg-dashboard-card4-bgcolor p-[23px]">
              <div className="flex items-center">
                <div className="bg-icon3 bg-cover md:w-[40px] w-[30px] md:h-[40px] h-[30px]" />
                <div className="ml-[14px] font-[800] text-[20px] leading-[23px]">
                  Escrow Stats
                </div>
              </div>
              <div className="mt-[20px]">
                <div className="flex justify-between sm:items-center w-full">
                  <div className="font-[500] text-[#fff] text-[14px] leading-[17px]">
                    In Escrow
                  </div>
                  <div className="md:text-[20px] text-[16px] leading-[23px] md:font-[800] font-[400]">
                    $ {totalValue}
                  </div>
                </div>
                <div className="mt-[28px] flex justify-between sm:items-center w-full">
                  <div className="font-[500] text-[#fff] text-[14px] leading-[17px]">
                    Active
                  </div>
                  <div className="md:text-[20px] text-[16px] leading-[23px] md:font-[800] font-[400]">
                    {
                      escrowData.filter((escrow) => {
                        return escrow.active === true;
                      }).length
                    }
                  </div>
                </div>
                <div className="mt-[28px] flex justify-between sm:items-center w-full">
                  <div className="font-[500] text-[#fff] text-[14px] leading-[17px]">
                    Completed
                  </div>
                  <div className="md:text-[20px] text-[16px] leading-[23px] md:font-[800] font-[400]">
                    {
                      escrowData.filter((escrow) => {
                        return escrow.active === false;
                      }).length
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[10px] bg-dashboard-card1-bgcolor py-[23px] xl:px-[50px] px-[20px]">
              <div className="flex items-center opacity-10">
                <div className="bg-icon1 bg-cover md:w-[40px] w-[30px] md:h-[40px] h-[30px]" />
                <div className="ml-[14px] font-[800] text-[20px] leading-[23px]">
                  Profile Score
                </div>
              </div>
              <div className="relative mt-[20px] w-[235px] h-[118px] mx-auto text-[#8e8e8e] font-bold text-[36px] flex justify-center items-center">
                <div className="absolute left-0 top-0 bg-chart w-[235px] h-[118px] bg-cover m-auto opacity-10"></div>
                <div className="translate-y-[-20px]">Coming soon</div>
              </div>
            </div>
            <div className="rounded-[10px] bg-dashboard-card3-bgcolor p-[23px]">
              <div className="flex items-center opacity-10">
                <div className="bg-icon2 bg-cover md:w-[40px] w-[30px] md:h-[40px] h-[30px]" />
                <div className="ml-[14px] font-[800] text-[20px] leading-[23px]">
                  Feedback
                </div>
              </div>
              <div className="relative mt-[20px] w-[235px] h-[118px] mx-auto text-[#8e8e8e] font-bold text-[36px] flex justify-center items-center">
                <div className="absolute left-0 top-0 bg-stars w-[235px] h-[118px] bg-cover m-auto opacity-10"></div>
                <div className="translate-y-[-20px]">Coming soon</div>
              </div>
            </div>
          </div>
          <div className="mt-[51px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
          <div className="mt-[35px] flex justify-between sm:items-center sm:flex-row w-full flex-wrap">
            <div className="flex items-center mr-[20px] mb-[1rem]">
              <div className="font-[600] md:text-[22px] text-[18px] leading-[26px]">
                My Escrows
              </div>
              <div
                className="ml-[32px] md:rounded-[10px] rounded-[5px] md:w-[115px] w-[80px] h-[35px] flex justify-center items-center bg-dashboard-button1-bgcolor font-[600] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                onClick={() => {
                  if (wallet) {
                    setStage(1);
                  } else toast("Please connect wallet");
                }}
              >
                CREATE
              </div>
            </div>
            <div className="mt-[20px] md:mt-0 rounded-[20px] bg-dashboard-buttonwrapper-bgcolor w-[246px] md:h-[42px] h-[35px] p-[3px] flex justify-between sm:items-center sm:flex-row mb-[1rem]">
              <div
                className={
                  myStatus === "active"
                    ? "w-[115.69px] md:h-[35px] h-[30px] flex justify-center items-center bg-dashboard-button1-bgcolor md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                    : "w-[115.69px] md:h-[35px] h-[30px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                }
                onClick={() => setMyStatus("active")}
              >
                Active
              </div>
              <div
                className={
                  myStatus === "completed"
                    ? "w-[115.69px] md:h-[35px] h-[30px] flex justify-center items-center bg-dashboard-button1-bgcolor md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                    : "w-[115.69px] md:h-[35px] h-[30px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                }
                onClick={() => setMyStatus("completed")}
              >
                Completed
              </div>
            </div>
          </div>
          <div className="mt-[46px] pb-[60px] grid md:grid-cols-3 grid-cols-1 gap-4">
            {escrowData
              .filter((escrow) => {
                if (myStatus === "active")
                  return (
                    escrow.initializerKey.toString() === publicKey.toString() &&
                    escrow.active === true
                  );
                if (myStatus === "completed")
                  return (
                    escrow.initializerKey.toString() === publicKey.toString() &&
                    escrow.active === false
                  );
              })
              .map((myEscrow, idx) => {
                return (
                  <div
                    key={idx}
                    className="rounded-[10px] bg-dashboard-card2-bgcolor"
                  >
                    <div
                      className={
                        myEscrow.disputeStatus
                          ? `bg-dashboard-card2-interior1-bgcolor p-[23px] rounded-[10px]`
                          : `bg-dashboard-card2-interior2-bgcolor p-[23px] rounded-[10px]`
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-icon4 bg-cover w-[40px] h-[40px]" />
                          <div className="ml-[14px]">
                            <div className="text-[#ADADAD] font-[300] text-[10px] leading-[12px]">{`Escrow #${myEscrow.randomSeed}`}</div>
                            <div className="font-[500] text-[20px] leading-[23px]">
                              {myEscrow.offchainData.description}
                            </div>
                          </div>
                        </div>
                        {/* {myEscrow.disputeStatus && (
                          <div className="bg-[#ad2c44] px-[24px] py-[3px] text-[12px] rounded-[40px]">
                            Disputed
                          </div>
                        )} */}
                      </div>

                      <div className="mt-[20px]">
                        <div className="flex justify-between sm:items-center w-full">
                          <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                            Amount
                          </div>
                          <div className="md:text-[20px] text-[16px] leading-[23px] md:font-[800] font-[400]">
                            {`$ ${
                              myEscrow.initializerAmount[0] +
                              myEscrow.initializerAmount[1] +
                              myEscrow.initializerAmount[2] +
                              myEscrow.initializerAmount[3] +
                              myEscrow.initializerAmount[4]
                            }`}
                          </div>
                        </div>
                      </div>
                      <div className="mt-[20px]">
                        <div className="flex justify-between sm:items-center w-full">
                          <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                            Status
                          </div>
                          <div className="md:text-[20px] text-[16px] leading-[23px] md:font-[800] font-[400]">
                            {myEscrow.active ? (
                              myEscrow.disputeStatus ? (
                                <span className="text-[#ffffff]">Disputed</span>
                              ) : (
                                <span className="text-[#ffffff]">
                                  In Progress
                                </span>
                              )
                            ) : (
                              <span className="text-[#ffffff]">Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex flex-row-reverse py-[12px] px-[23px] items-center cursor-pointer"
                      onClick={async () => {
                        console.log("myEscrow.index", myEscrow);
                        getEscrowDate(myEscrow.randomSeed);
                        setCurrentEscrow(myEscrow.index);
                        setSelectedMilestone(0);
                        setStage(2);
                      }}
                    >
                      <div className="bg-link bg-cover w-[12px] h-[12px] cursor-pointer" />
                      <div className="font-[500] md:text-[16px] text-[14px] leading-[19px] mr-[10px]">
                        View Escrow
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
          <div className="mt-[35px] flex justify-between sm:items-center sm:flex-row w-full flex-wrap">
            <div className="flex items-center mr-[20px] mb-[1rem]">
              <div className="font-[600] md:text-[22px] text-[18px] leading-[26px]">
                Incoming Escrows
              </div>
            </div>
            <div className="rounded-[20px] bg-dashboard-buttonwrapper-bgcolor w-[246px] md:h-[42px] h-[35px] p-[3px] flex justify-between sm:items-center sm:flex-row mb-[1rem]">
              <div
                className={
                  forMeStatus === "active"
                    ? "w-[115.69px] md:h-[35px] h-[30px] flex justify-center items-center bg-dashboard-button1-bgcolor md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                    : "w-[115.69px] md:h-[35px] h-[30px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                }
                onClick={() => setForMeStatus("active")}
              >
                Active
              </div>
              <div
                className={
                  forMeStatus === "completed"
                    ? "w-[115.69px] md:h-[35px] h-[30px] flex justify-center items-center bg-dashboard-button1-bgcolor md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                    : "w-[115.69px] md:h-[35px] h-[30px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor md:text-[18px] text-[16px] leading-[22px] font-[500] rounded-[20px] cursor-pointer"
                }
                onClick={() => setForMeStatus("completed")}
              >
                Completed
              </div>
            </div>
          </div>
          <div className="mt-[46px] pb-[177px] grid md:grid-cols-3 grid-cols-1 gap-4">
            {escrowData
              .filter((escrow) => {
                if (forMeStatus === "active")
                  return (
                    escrow.taker.toString() === publicKey.toString() &&
                    escrow.active === true
                  );
                if (forMeStatus === "completed")
                  return (
                    escrow.taker.toString() === publicKey.toString() &&
                    escrow.active === false
                  );
              })
              .map((myEscrow, idx) => {
                return (
                  <div
                    key={idx}
                    className="rounded-[10px] bg-dashboard-card2-bgcolor"
                  >
                    <div
                      className={
                        myEscrow.disputeStatus
                          ? `bg-dashboard-card2-interior1-bgcolor p-[23px] rounded-[10px]`
                          : `bg-dashboard-card2-interior2-bgcolor p-[23px] rounded-[10px]`
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-icon4 bg-cover w-[40px] h-[40px]" />
                          <div className="ml-[14px]">
                            <div className="text-[#ADADAD] font-[300] text-[10px] leading-[12px]">{`Escrow #${myEscrow.randomSeed}`}</div>
                            <div className="font-[500] text-[20px] leading-[23px]">
                              {myEscrow.offchainData.description}
                            </div>
                          </div>
                        </div>
                        {/* {myEscrow.disputeStatus && (
                          <div className="bg-[#ad2c44] px-[24px] py-[3px] text-[12px] rounded-[40px]">
                            Disputed
                          </div>
                        )} */}
                      </div>
                      <div className="mt-[20px]">
                        <div className="flex justify-between sm:items-center w-full">
                          <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                            Amount
                          </div>
                          <div className="md:text-[20px] text-[16px] leading-[23px] md:font-[800] font-[400]">
                            {`$ ${
                              myEscrow.initializerAmount[0] +
                              myEscrow.initializerAmount[1] +
                              myEscrow.initializerAmount[2] +
                              myEscrow.initializerAmount[3] +
                              myEscrow.initializerAmount[4]
                            }`}
                          </div>
                        </div>
                      </div>
                      <div className="mt-[20px]">
                        <div className="flex justify-between sm:items-center w-full">
                          <div className="font-[300] text-[#C7C7C7] text-[14px] leading-[17px]">
                            Status
                          </div>
                          <div className="md:text-[20px] text-[16px] leading-[23px] md:font-[800] font-[400]">
                            {myEscrow.active ? (
                              myEscrow.disputeStatus ? (
                                <span className="text-[#ffffff]">Disputed</span>
                              ) : (
                                <span className="text-[#ffffff]">
                                  In Progress
                                </span>
                              )
                            ) : (
                              <span className="text-[#ffffff]">Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex flex-row-reverse py-[12px] px-[23px] items-center cursor-pointer"
                      onClick={async () => {
                        console.log("myEscrow.index", myEscrow);
                        getEscrowDate(myEscrow.randomSeed);
                        setCurrentEscrow(myEscrow.index);
                        setSelectedMilestone(0);
                        setStage(3);
                      }}
                    >
                      <div className="bg-link bg-cover w-[12px] h-[12px] cursor-pointer" />
                      <div className="font-[500] md:text-[16px] text-[14px] leading-[19px] mr-[10px]">
                        View Escrow
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {stage === 1 && (
        <div className="pb-[249px]">
          <div className="flex items-center">
            <div className="font-[600] md:text-[40px] text-[30px] pt-[130px]">
              Create Escrow
            </div>
          </div>
          <div className="mt-[14px] md:text-[14px] text-[12px] leading-[21px] font-[300]">
            Create a new escrow and protect your payments.
          </div>
          <div className="mt-[35px] grid grid-cols-1 lg:grid-cols-2 gap-[5rem]">
            <div className="pt-[23px] md:border-b-[2px] border-[#7c98a9]">
              <div className="flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                  Name
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                    {descriptionErr}
                  </div>
                </div>
              </div>
              <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                  Receiver
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    required
                  />
                  <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                    {receiverErr}
                  </div>
                </div>
              </div>
              {/* {useModerator ? (
                <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                  <div className="w-[110px] text-[20px] mb-[.5rem] sm:mb-0">
                    Moderator
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                      value={moderator}
                      onChange={(e) => setModerator(e.target.value)}
                    />

                    {showModerator ? (
                      <ul className="absolute w-full bg-primary rounded-b-[5px] mt-[1px] border-[#7C98A9] z-[3]">
                        {moderators.map((item, index) => (
                          <li
                            key={`mod-${index}`}
                            className="w-full cursor-pointer py-[.5rem] px-[.5rem] overflow-hidden truncate hover:bg-primary bg-dark"
                            onClick={() => toggleModerator(item._id)}
                          >
                            {item._id}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      ""
                    )}

                    <div
                      className="moderator-toggle cursor-pointer absolute right-0 top-0 h-full w-[2rem] bg-secondary text-center z-[3] border-[#7C98A9] border-[1px] border-l-0
                     rounded-r-[5px]"
                      onClick={() => {
                        setModeratorVisibility(!showModerator);
                      }}
                    >
                      {showModerator ? (
                        <i className="fa fa-angle-up"></i>
                      ) : (
                        <i className="fa fa-angle-down"></i>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )} */}
              <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full relative">
                <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                  Amount
                </div>
                <div className="relative">
                  <input
                    type="number"
                    className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                    value={amount}
                    placeholder="0"
                    onChange={(e) => {
                      inputNumberAmount(e.target.value, setAmount);
                    }}
                    min={0}
                    required
                  />
                  <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                    {amountErr}
                  </div>
                </div>
                <button className="absolute right-[1px] top-[30px] md:top-[1px] text-[12px] text-white bg-dark z-[2] leading-[38px] px-[10px] rounded-[5px] round-l-0">
                  USDC
                </button>
              </div>

              {/* <div
                className="w-[220px] h-[40px] mr-[0] px-[12px] rounded-[5px] bg-[#7C98A9] flex justify-center items-center font-[800] text-[18px] leading-[21px] cursor-pointer sm:mb-0 mb-[1rem] ml-auto mt-[50px]"
                onClick={() => {
                  if (useModerator) {
                    setModerator("");
                  }
                  setUseModerator(!useModerator);
                }}
              >
                {useModerator ? "Don't need Moderator" : "Need Moderator"}
              </div> */}
              {/* <div className="mt-[30px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div> */}
            </div>
            <div className="rounded-[10px] bg-fee-panel-bgcolor md:py-[23px] py-[10px] md:px-[43px] px-[16px] hidden md:block">
              <div className="font-[800] md:text-[32px] text-[20px] leading-[38px]">
                Fees
              </div>
              <div className="mt-[43px] flex justify-between sm:items-center w-full">
                <div className="md:text-[20px] text-[14px] leading-[23px]">
                  Platform fee {`(${adminData?.adminFee}%)`}
                </div>
                {adminData && (
                  <div className="md:text-[20px] text-[14px] font-[600]">
                    {`${(amount * adminData?.adminFee) / 100}`} USDC
                  </div>
                )}
              </div>
              {/* <div className="mt-[27px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="text-[20px] leading-[23px">
                  Holder Discount {`(${adminData?.resolverFee}%)`}
                </div>
                <div className="text-[20px] font-[600]">
                  {adminData && (
                    <div className="text-[20px] font-[600]">
                      {`${(amount * adminData?.resolverFee) / 100}`} USDC
                    </div>
                  )}
                </div>
              </div> */}
              <div className="mt-[30px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
              <div className="mt-[25px] flex justify-between sm:items-center w-full">
                <div className="md:text-[20px] text-[14px] leading-[23px]">
                  Receiver will get
                </div>
                <div className="md:text-[20px] text-[14px] font-[600]">
                  {adminData && (
                    <div className="md:text-[20px] text-[14px] font-[600]">
                      {`${(amount * (100 - adminData?.adminFee)) / 100}`} USDC
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[47px] grid lg:grid-cols-2 grid-cols-1 gap-[5rem]">
            <div>
              <div className="flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="w-[110px] md:text-[20px] text-[18px] mb-[.5rem] sm:mb-0">
                  Milestones
                </div>
                <div className="flex flex-wrap">
                  <div
                    className="w-[110px] md:h-[40px] h-[32px] mr-[30px] px-[12px] rounded-[5px] bg-[#7C98A9] hover:bg-transparent hover:border-[#7C98A9] hover:border-[1px] flex justify-center items-center font-[800] md:text-[18px] text-[14px] leading-[21px] cursor-pointer sm:mb-0 mb-[1rem]"
                    onClick={() => {
                      if (currentMilestone < 5)
                        setCurrentMilestone(currentMilestone + 1);
                      else toast("Max milestone number is 5");
                    }}
                  >
                    ADD +
                  </div>
                  <div
                    className="w-[110px] md:h-[40px] h-[32px] mr-[0] px-[12px] rounded-[5px] hover:bg-[#7C98A9] border-[#7C98A9] border-[1px] flex justify-center items-center font-[800] md:text-[18px] text-[14px] leading-[21px] cursor-pointer sm:mb-0 mb-[1rem]"
                    onClick={() => resetMilestone()}
                  >
                    Reset
                  </div>
                </div>
              </div>

              {currentMilestone > 0 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 1
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={milestone1}
                        onChange={(e) => setMilestone1(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone1Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={amount1}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount1)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount1Err}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentMilestone > 1 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 2
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={milestone2}
                        onChange={(e) => setMilestone2(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone2Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={amount2}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount2)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount2Err}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentMilestone > 2 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 3
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={milestone3}
                        onChange={(e) => setMilestone3(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone3Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={amount3}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount3)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount3Err}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentMilestone > 3 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 4
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={milestone4}
                        onChange={(e) => setMilestone4(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone4Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={amount4}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount4)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount4Err}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentMilestone > 4 && (
                <div>
                  <div className="mt-[36px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Milestone 5
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={milestone5}
                        onChange={(e) => setMilestone5(e.target.value)}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {milestone5Err}
                      </div>
                    </div>
                  </div>
                  <div className="mt-[30px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                    <div className="w-[110px] md:text-[20px] text-[14px] mb-[.5rem] sm:mb-0">
                      Amount
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        className="md:w-[330px] w-full max-w-full h-[40px] px-[12px] rounded-[5px] border-[1px] border-[#7C98A9] bg-black"
                        value={amount5}
                        onChange={(e) =>
                          inputNumberAmount(e.target.value, setAmount5)
                        }
                        min={0}
                      />
                      <div className="absolute top-[42px] text-[11px] text-[#ad2c44]">
                        {amount5Err}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-[10px] bg-fee-panel-bgcolor md:py-[23px] py-[10px] md:px-[43px] px-[16px] block md:hidden">
              <div className="font-[800] md:text-[32px] text-[20px] leading-[38px]">
                Fees
              </div>
              <div className="mt-[43px] flex justify-between sm:items-center w-full">
                <div className="md:text-[20px] text-[14px] leading-[23px]">
                  Platform fee {`(${adminData?.adminFee}%)`}
                </div>
                {adminData && (
                  <div className="md:text-[20px] text-[14px] font-[600]">
                    {`${(amount * adminData?.adminFee) / 100}`} USDC
                  </div>
                )}
              </div>
              {/* <div className="mt-[27px] flex justify-between sm:items-center flex-col sm:flex-row w-full">
                <div className="text-[20px] leading-[23px">
                  Holder Discount {`(${adminData?.resolverFee}%)`}
                </div>
                <div className="text-[20px] font-[600]">
                  {adminData && (
                    <div className="text-[20px] font-[600]">
                      {`${(amount * adminData?.resolverFee) / 100}`} USDC
                    </div>
                  )}
                </div>
              </div> */}
              <div className="mt-[30px] border-b-[2px] border-[#7c98a9] opacity-[0.4] h-0"></div>
              <div className="mt-[25px] flex justify-between sm:items-center w-full">
                <div className="md:text-[20px] text-[14px] leading-[23px]">
                  Receiver will get
                </div>
                <div className="md:text-[20px] text-[14px] font-[600]">
                  {adminData && (
                    <div className="md:text-[20px] text-[14px] font-[600]">
                      {`${(amount * (100 - adminData?.adminFee)) / 100}`} USDC
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-row">
              <div
                className="w-[120px] md:h-[40px] h-[32px] px-[12px] rounded-[5px] bg-[#7C98A9] hover:bg-transparent hover:border-[#7C98A9] hover:border-[1px] flex justify-center items-center font-[800] md:text-[18px] text-[14px] leading-[21px] cursor-pointer"
                onClick={createEscrow}
              >
                {!isLoading1 ? (
                  "CREATE"
                ) : (
                  <div className="bg-loading bg-cover w-[60px] h-[60px]" />
                )}
              </div>
              <div
                className="ml-[30px] w-[120px] md:h-[40px] h-[32px] px-[12px] rounded-[5px] hover:bg-[#7C98A9] border-[#7C98A9] border-[1px] flex justify-center items-center font-[800] md:text-[18px] text-[14px] leading-[21px] cursor-pointer"
                onClick={() => {
                  setStage(0);
                  //reset escrow info
                  setDescription("");
                  setReceiver("");
                  setAmount(0);
                  resetMilestone;
                }}
              >
                CANCEL
              </div>
            </div>
          </div>
        </div>
      )}
      {stage === 2 && (
        <div className="mb-[150px] grid md:grid-cols-2 gap-[3rem] mt-[10rem] grid-cols-1">
          <div className="order-2 md:order-1  md:max-w-none sm:max-w-[420px] w-full">
            {escrowRestData.milestones &&
              escrowRestData.milestones.map(
                (item: any, index: number) =>
                  item.amount > 0 && (
                    <div
                      key={`milestone-${index}`}
                      className="flex items-center mt-[10px]"
                    >
                      <div className="flex justify-center items-center rounded-[40px] w-[40px] h-[40px] bg-milestone-index1-bgcolor text-[20px] font-[800]">
                        {index + 1}
                      </div>

                      <div
                        className={
                          index === selectedMilestone
                            ? "ml-[14px] rounded-[10px] bg-milestone-index2-bgcolor p-[23px] cursor-pointer grow"
                            : "ml-[14px] rounded-[10px] bg-milestone-index1-bgcolor p-[23px] cursor-pointer grow"
                        }
                        onClick={() => {
                          setSelectedMilestone(index);
                        }}
                      >
                        <div className="flex items-center">
                          {escrowData[currentEscrow].initializerAmount[
                            index
                          ] === 0 ? (
                            <div className="bg-completed bg-cover w-[40px] h-[40px]" />
                          ) : (
                            <div className="bg-icon4 bg-cover w-[40px] h-[40px]" />
                          )}{" "}
                          <div className="ml-[13px] text-[20px] leading-[23px] font-[400] grow break-all">
                            {item?.mileston}
                          </div>
                        </div>
                        <div className="mt-[15px] break-all text-[#ADADAD]">
                          {escrowRestData.milestone1}
                        </div>
                        <div className="mt-[15px]">
                          <div className="flex justify-end items-center">
                            <div>Amount:</div>
                            <div className="text-[#21c55b] ml-[10px]">
                              {`${item.amount} USDC`}
                            </div>
                          </div>
                          <div className="flex justify-end items-center">
                            <div>Status: </div>
                            <div className="text-[#f1102f] ml-[10px]">
                              {escrowData[currentEscrow].initializerAmount[
                                index
                              ] === 0 ? (
                                <span className="text-[#21c55b]">
                                  Completed
                                </span>
                              ) : escrowData[currentEscrow].disputeStatus ? (
                                <span className="text-[#f1102f]">Disputed</span>
                              ) : (
                                "In Progress"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}

            <div className="mt-[40px] flex justify-between items-center">
              {escrowData[currentEscrow].active &&
                !escrowData[currentEscrow].disputeStatus && (
                  <div
                    className="md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] bg-[#7C98A9] hover:border-[1px] hover:border-[#7C98A9] hover:bg-transparent flex justify-center items-center md:font-[800] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                    onClick={() => approvePayment()}
                  >
                    {!isLoading1 ? (
                      "Complete"
                    ) : (
                      <div className="bg-loading bg-cover w-[60px] h-[60px]" />
                    )}
                  </div>
                )}
              {escrowData[currentEscrow].active &&
                !escrowData[currentEscrow].disputeStatus && (
                  <div
                    className="md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] bg-[#1f0d14] border-[1px] border-[#C20000] hover:bg-[#C20000] flex justify-center items-center md:font-[800] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                    onClick={() => {
                      dispute();
                    }}
                  >
                    {!isLoading2 ? (
                      "Dispute"
                    ) : (
                      <div className="bg-loading bg-cover w-[60px] h-[60px]" />
                    )}
                  </div>
                )}
              <div
                className="md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] border-[1px] border-[#7C98A9] hover:bg-[#7C98A9] flex justify-center items-center md:font-[800] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                onClick={() => setStage(0)}
              >
                Back
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="border-[1px] border-[#7C98A9] mt-[10px] rounded-[10px] p-[20px]">
              <div className="mt-[14px] text-[14px] leading-[21px] font-[300] text-[#CFCFCF]">
                Escrow # {escrowData[currentEscrow].randomSeed}
              </div>

              <div className="font-[600] lg:text-[40px] sm:text-[30px] text-[24px]">
                {escrowRestData.description}
              </div>

              <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between">
                <div className=" text-[#CFCFCF]">Amount</div>
                <div className="font-[400]">{escrowRestData.amount} USDC</div>
              </div>

              <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between">
                <div className=" text-[#CFCFCF]">Receiver</div>
                <span className="text-sm ml-[5px] truncate max-w-[100%] block font-[400]">
                  {shortenAddress(escrowRestData.receiver)}
                </span>
              </div>

              {/* {escrowData[currentEscrow].disputeStatus && (
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between">
                  Moderator:{" "}
                  <span className="text-sm font-[400]">
                    {escrowData[currentEscrow].disputeStatus && adminData
                      ? shortenAddress(adminData?.resolver.toBase58())
                      : "None"}
                  </span>
                </div>
              )} */}

              <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between">
                <div className=" text-[#CFCFCF]">Disputed</div>
                {escrowData[currentEscrow].disputeStatus ? (
                  <span className="text-[#ad2c44] font-bold">Yes</span>
                ) : (
                  "No"
                )}
              </div>

              {escrowRestData.created_at && (
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex flex-row-reverse text-[#CFCFCF]">
                  {escrowRestData.date}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {stage === 3 && (
        <div className="mb-[150px] grid md:grid-cols-2 gap-[3rem] mt-[10rem] grid-cols-1">
          <div className="order-2 md:order-1  md:max-w-none sm:max-w-[420px] w-full">
            {escrowRestData.milestones &&
              escrowRestData.milestones.map(
                (item: any, index: number) =>
                  item.amount > 0 && (
                    <div
                      key={`milestone-${index}`}
                      className="flex items-center mt-[10px]"
                    >
                      <div className="flex justify-center items-center rounded-[40px] w-[40px] h-[40px] bg-milestone-index1-bgcolor text-[20px] font-[800]">
                        {index + 1}
                      </div>

                      <div
                        className="ml-[14px] rounded-[10px] bg-milestone-index2-bgcolor p-[23px] cursor-pointer grow"
                        onClick={() => {
                          setSelectedMilestone(index);
                        }}
                      >
                        <div className="flex items-center">
                          {escrowData[currentEscrow].initializerAmount[
                            index
                          ] === 0 ? (
                            <div className="bg-completed bg-cover w-[40px] h-[40px]" />
                          ) : (
                            <div className="bg-icon4 bg-cover w-[40px] h-[40px]" />
                          )}{" "}
                          <div className="ml-[13px] text-[20px] leading-[23px] font-[400] grow break-all">
                            {item?.mileston}
                          </div>
                        </div>
                        <div className="mt-[15px] break-all text-[#ADADAD]">
                          {escrowRestData.milestone1}
                        </div>
                        <div className="mt-[15px]">
                          <div className="flex justify-end items-center">
                            <div>Amount:</div>
                            <div className="text-[#21c55b] ml-[10px]">
                              {`${item.amount} USDC`}
                            </div>
                          </div>
                          <div className="flex justify-end items-center">
                            <div>Status: </div>
                            <div className="text-[#f1102f] ml-[10px]">
                              {escrowData[currentEscrow].initializerAmount[
                                index
                              ] === 0 ? (
                                <span className="text-[#21c55b]">
                                  Completed
                                </span>
                              ) : escrowData[currentEscrow].disputeStatus ? (
                                <span className="text-[#f1102f]">Disputed</span>
                              ) : (
                                "In Progress"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}

            <div className="mt-[40px] flex justify-between items-center">
              {escrowData[currentEscrow].active &&
                !escrowData[currentEscrow].disputeStatus && (
                  <div
                    className="md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] bg-[#7C98A9] hover:border-[1px] hover:border-[#7C98A9] hover:bg-transparent flex justify-center items-center md:font-[800] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                    onClick={() => refundPayment()}
                  >
                    {!isLoading1 ? (
                      "Refund"
                    ) : (
                      <div className="bg-loading bg-cover w-[60px] h-[60px]" />
                    )}
                  </div>
                )}
              {escrowData[currentEscrow].active &&
                !escrowData[currentEscrow].disputeStatus && (
                  <div
                    className="md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] bg-[#1f0d14] border-[1px] border-[#C20000] hover:bg-[#C20000] flex justify-center items-center md:font-[800] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                    onClick={() => {
                      dispute();
                    }}
                  >
                    {!isLoading2 ? (
                      "Dispute"
                    ) : (
                      <div className="bg-loading bg-cover w-[60px] h-[60px]" />
                    )}
                  </div>
                )}
              <div
                className="md:h-[40px] h-[32px] px-[12px] grow max-w-[100px] md:max-w-[130px] rounded-[5px] border-[1px] border-[#7C98A9] hover:bg-[#7C98A9] flex justify-center items-center md:font-[800] font-[400] md:text-[18px] text-[16px] leading-[21px] cursor-pointer"
                onClick={() => setStage(0)}
              >
                Back
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="border-[1px] border-[#7C98A9] mt-[10px] rounded-[10px] p-[20px]">
              <div className="mt-[14px] text-[14px] leading-[21px] font-[300] text-[#CFCFCF]">
                Escrow # {escrowData[currentEscrow].randomSeed}
              </div>

              <div className="font-[600] lg:text-[40px] sm:text-[30px] text-[24px]">
                {escrowRestData.description}
              </div>

              <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between">
                <div className=" text-[#CFCFCF]">Amount</div>
                <div className="font-[400]">{escrowRestData.amount} USDC</div>
              </div>

              {escrowRestData.moderator && (
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between">
                  <div className=" text-[#CFCFCF]">Creator</div>
                  <span className="text-sm ml-[5px] truncate max-w-[100%] block font-[400]">
                    {shortenAddress(
                      escrowData[currentEscrow].initializerKey.toString()
                    )}
                  </span>
                </div>
              )}

              {/* {escrowData[currentEscrow].disputeStatus && (
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between">
                  Moderator
                  <span className="text-sm font-[400]">
                    {escrowData[currentEscrow].disputeStatus && adminData
                      ? shortenAddress(adminData?.resolver.toBase58())
                      : "None"}
                  </span>
                </div>
              )} */}

              <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex justify-between">
                <div className=" text-[#CFCFCF]">Disputed</div>
                {escrowData[currentEscrow].disputeStatus ? (
                  <span className="text-[#ad2c44] font-bold">Yes</span>
                ) : (
                  "No"
                )}
              </div>

              {escrowRestData.created_at && (
                <div className="mt-[14px] text-[14px] leading-[21px] font-[300] flex flex-row-revers text-[#CFCFCF]">
                  <span>{escrowRestData.date}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};
export default Home;
